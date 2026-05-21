import { handleCors } from "../shared/cors.ts";
import { getRequestId, HttpError, json, readJson } from "../shared/http.ts";
import { log } from "../shared/logger.ts";
import { assertRateLimit, requireUser } from "../shared/supabase.ts";
import { createEmbedding, createResponse, extractOutputText, sha256 } from "../shared/openai.ts";

type AnalyzeBody = {
  garment_id?: string;
  force?: boolean;
};

type GarmentAnalysis = {
  category: string;
  subcategory: string;
  style: string;
  season: string;
  material: string;
  pattern: string;
  fit: string;
  gender_style: string;
  occasion: string;
  dominant_palette: string[];
  color_primary: string;
  color_secondary: string;
  ai_tags: string[];
  confidence_score: number;
};

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "category",
    "subcategory",
    "style",
    "season",
    "material",
    "pattern",
    "fit",
    "gender_style",
    "occasion",
    "dominant_palette",
    "color_primary",
    "color_secondary",
    "ai_tags",
    "confidence_score"
  ],
  properties: {
    category: { type: "string" },
    subcategory: { type: "string" },
    style: { type: "string" },
    season: { type: "string" },
    material: { type: "string" },
    pattern: { type: "string" },
    fit: { type: "string" },
    gender_style: { type: "string" },
    occasion: { type: "string" },
    dominant_palette: { type: "array", items: { type: "string" }, maxItems: 6 },
    color_primary: { type: "string" },
    color_secondary: { type: "string" },
    ai_tags: { type: "array", items: { type: "string" }, maxItems: 12 },
    confidence_score: { type: "number", minimum: 0, maximum: 1 }
  }
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = getRequestId(req);

  try {
    const { user, userClient, serviceClient } = await requireUser(req);
    const body = await readJson<AnalyzeBody>(req);
    if (!body.garment_id) throw new HttpError(400, "garment_id is required", "VALIDATION_ERROR");

    await assertRateLimit(userClient, "ai:analyze_garment", 12, 60 * 60 * 24);

    const { data: garment, error: garmentError } = await serviceClient
      .from("garments")
      .select("*")
      .eq("id", body.garment_id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (garmentError || !garment) throw new HttpError(404, "Garment not found", "NOT_FOUND");

    if (!body.force && garment.ai_status === "complete" && garment.category) {
      return json({ status: "cached", garment }, 200, requestId);
    }

    await serviceClient.from("ai_processing_jobs").insert({
      user_id: user.id,
      garment_id: garment.id,
      job_type: "analyze_garment",
      status: "processing",
      provider: "openai",
      request_id: requestId,
      input_hash: garment.file_hash
    });

    await serviceClient.from("garments").update({ ai_status: "processing" }).eq("id", garment.id);

    const sourcePath = garment.storage_path ?? garment.image_url;
    let imageUrl = sourcePath as string;

    if (!imageUrl.startsWith("http")) {
      const signed = await serviceClient.storage.from("garment-originals").createSignedUrl(imageUrl, 300);
      if (signed.error || !signed.data?.signedUrl) {
        throw new HttpError(500, "Could not sign source image", "STORAGE_SIGN_FAILED");
      }
      imageUrl = signed.data.signedUrl;
    }

    const model = Deno.env.get("CLOSETLY_VISION_MODEL") ?? "gpt-5.4-mini";
    const response = await createResponse({
      model,
      input: [
        {
          role: "system",
          content:
            "You are a fashion cataloging assistant. Return compact JSON only. Prefer normalized English taxonomy values."
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Analyze this garment for a mobile closet app. Identify fashion metadata, colors, style tags, and confidence."
            },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "low"
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "garment_analysis",
          strict: true,
          schema: analysisSchema
        }
      }
    });

    const output = extractOutputText(response);
    const analysis = JSON.parse(output) as GarmentAnalysis;
    const similaritySource = [
      analysis.category,
      analysis.subcategory,
      analysis.style,
      analysis.season,
      analysis.material,
      analysis.pattern,
      analysis.color_primary,
      analysis.color_secondary,
      ...analysis.ai_tags
    ].join("|");

    const embeddingEnabled = Deno.env.get("CLOSETLY_EMBEDDINGS_ENABLED") === "true";
    const embedding = embeddingEnabled ? await createEmbedding(similaritySource) : null;

    const updatePayload: Record<string, unknown> = {
      category: analysis.category,
      subcategory: analysis.subcategory,
      style: analysis.style,
      season: analysis.season,
      material: analysis.material,
      pattern: analysis.pattern,
      fit: analysis.fit,
      gender_style: analysis.gender_style,
      occasion: analysis.occasion,
      dominant_palette: analysis.dominant_palette,
      color_primary: analysis.color_primary,
      color_secondary: analysis.color_secondary,
      ai_tags: analysis.ai_tags,
      confidence_score: analysis.confidence_score,
      ai_status: "complete",
      ai_raw: response,
      similarity_hash: await sha256(similaritySource)
    };

    if (embedding) {
      updatePayload.embedding_vector = `[${embedding.join(",")}]`;
    }

    const { data: updated, error: updateError } = await serviceClient
      .from("garments")
      .update(updatePayload)
      .eq("id", garment.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    await serviceClient
      .from("ai_processing_jobs")
      .update({ status: "complete", completed_at: new Date().toISOString() })
      .eq("garment_id", garment.id)
      .eq("request_id", requestId);

    await serviceClient.from("analytics_events").insert({
      user_id: user.id,
      event_name: "ai_garment_analysis_complete",
      source: "edge",
      request_id: requestId,
      properties: { model, garment_id: garment.id, embedding_enabled: embeddingEnabled }
    });

    log("info", "garment analysis complete", { requestId, userId: user.id, garmentId: garment.id, model });
    return json({ status: "complete", garment: updated }, 200, requestId);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : "UNEXPECTED_ERROR";
    log("error", "garment analysis failed", { requestId, error: String(error) });
    return json({ error: String(error), code, requestId }, status, requestId);
  }
});
