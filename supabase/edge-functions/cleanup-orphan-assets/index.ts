import { createServiceClient } from "../shared/supabase.ts";
import { getRequestId, HttpError, json } from "../shared/http.ts";
import { handleCors } from "../shared/cors.ts";
import { log } from "../shared/logger.ts";

type StorageFile = {
  name: string;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
};

const listRecursive = async (
  serviceClient: ReturnType<typeof createServiceClient>,
  bucket: string,
  prefix = ""
): Promise<string[]> => {
  const { data, error } = await serviceClient.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;

  const paths: string[] = [];
  for (const item of (data ?? []) as StorageFile[]) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    const looksLikeFile = item.name.includes(".");
    if (looksLikeFile) {
      paths.push(path);
    } else {
      paths.push(...(await listRecursive(serviceClient, bucket, path)));
    }
  }
  return paths;
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = getRequestId(req);

  try {
    const expectedSecret = Deno.env.get("CLEANUP_CRON_SECRET");
    if (!expectedSecret || req.headers.get("x-cron-secret") !== expectedSecret) {
      throw new HttpError(401, "Invalid cleanup secret", "UNAUTHORIZED");
    }

    const serviceClient = createServiceClient();
    const { data: rows, error } = await serviceClient
      .from("garments")
      .select("storage_path, thumbnail_path, processed_path")
      .is("deleted_at", null);

    if (error) throw error;

    const referenced = new Set<string>();
    for (const row of rows ?? []) {
      if (row.storage_path) referenced.add(`garment-originals:${row.storage_path}`);
      if (row.thumbnail_path) referenced.add(`garment-thumbnails:${row.thumbnail_path}`);
      if (row.processed_path) referenced.add(`garment-processed:${row.processed_path}`);
    }

    const buckets = ["garment-originals", "garment-thumbnails", "garment-processed"];
    const deleted: Record<string, number> = {};

    for (const bucket of buckets) {
      const files = await listRecursive(serviceClient, bucket);
      const orphaned = files.filter((path) => !referenced.has(`${bucket}:${path}`)).slice(0, 100);
      if (orphaned.length > 0) {
        const removal = await serviceClient.storage.from(bucket).remove(orphaned);
        if (removal.error) throw removal.error;
      }
      deleted[bucket] = orphaned.length;
    }

    log("info", "orphan asset cleanup complete", { requestId, deleted });
    return json({ status: "complete", deleted }, 200, requestId);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : "UNEXPECTED_ERROR";
    log("error", "orphan asset cleanup failed", { requestId, error: String(error) });
    return json({ error: String(error), code, requestId }, status, requestId);
  }
});
