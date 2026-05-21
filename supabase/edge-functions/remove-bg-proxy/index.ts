import { handleCors } from "../shared/cors.ts";
import { getRequestId, HttpError, json, readJson } from "../shared/http.ts";
import { log } from "../shared/logger.ts";
import { assertRateLimit, requireUser } from "../shared/supabase.ts";

type RemoveBgBody = {
  garment_id?: string;
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = getRequestId(req);

  try {
    const { user, userClient, serviceClient } = await requireUser(req);
    const body = await readJson<RemoveBgBody>(req);
    if (!body.garment_id) throw new HttpError(400, "garment_id is required", "VALIDATION_ERROR");

    await assertRateLimit(userClient, "ai:remove_background", 12, 60 * 60 * 24);

    const { data: garment, error } = await serviceClient
      .from("garments")
      .select("*")
      .eq("id", body.garment_id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (error || !garment) throw new HttpError(404, "Garment not found", "NOT_FOUND");
    if (garment.background_removed_url) {
      return json({ status: "cached", background_removed_url: garment.background_removed_url }, 200, requestId);
    }

    const apiKey = Deno.env.get("REMOVEBG_API_KEY");
    if (!apiKey) {
      await serviceClient.from("garments").update({ ai_status: "skipped" }).eq("id", garment.id);
      return json({ status: "skipped", reason: "REMOVEBG_API_KEY not configured" }, 200, requestId);
    }

    const sourcePath = garment.storage_path ?? garment.image_url;
    const signed = sourcePath.startsWith("http")
      ? { data: { signedUrl: sourcePath }, error: null }
      : await serviceClient.storage.from("garment-originals").createSignedUrl(sourcePath, 300);

    if (signed.error || !signed.data?.signedUrl) {
      throw new HttpError(500, "Could not sign source image", "STORAGE_SIGN_FAILED");
    }

    await serviceClient.from("ai_processing_jobs").insert({
      user_id: user.id,
      garment_id: garment.id,
      job_type: "remove_background",
      status: "processing",
      provider: "remove.bg",
      request_id: requestId,
      input_hash: garment.file_hash
    });

    const form = new FormData();
    form.set("image_url", signed.data.signedUrl);
    form.set("size", "auto");
    form.set("format", "png");

    const bgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form
    });

    if (!bgResponse.ok) {
      throw new HttpError(bgResponse.status, await bgResponse.text(), "REMOVE_BG_FAILED");
    }

    const imageBlob = await bgResponse.blob();
    const processedPath = `${user.id}/processed/${garment.id}.png`;
    const upload = await serviceClient.storage.from("garment-processed").upload(processedPath, imageBlob, {
      cacheControl: "31536000",
      contentType: "image/png",
      upsert: true
    });

    if (upload.error) throw upload.error;

    const publicUrl = serviceClient.storage.from("garment-processed").getPublicUrl(processedPath).data.publicUrl;

    await serviceClient
      .from("garments")
      .update({ background_removed_url: publicUrl, processed_path: processedPath })
      .eq("id", garment.id);

    await serviceClient
      .from("ai_processing_jobs")
      .update({ status: "complete", completed_at: new Date().toISOString() })
      .eq("garment_id", garment.id)
      .eq("request_id", requestId);

    log("info", "background removed", { requestId, userId: user.id, garmentId: garment.id });
    return json({ status: "complete", background_removed_url: publicUrl }, 200, requestId);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : "UNEXPECTED_ERROR";
    log("error", "remove background failed", { requestId, error: String(error) });
    return json({ error: String(error), code, requestId }, status, requestId);
  }
});
