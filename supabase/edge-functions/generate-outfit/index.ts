import { handleCors } from "../shared/cors.ts";
import { getRequestId, HttpError, json, readJson } from "../shared/http.ts";
import { log } from "../shared/logger.ts";
import { createResponse, extractOutputText, sha256 } from "../shared/openai.ts";
import { assertRateLimit, requireUser } from "../shared/supabase.ts";

type GenerateBody = {
  occasion?: string;
  season?: string;
};

type GeneratedOutfit = {
  name: string;
  occasion: string;
  season: string;
  style_tags: string[];
  garment_ids: string[];
  rationale: string;
};

const outfitSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "occasion", "season", "style_tags", "garment_ids", "rationale"],
  properties: {
    name: { type: "string" },
    occasion: { type: "string" },
    season: { type: "string" },
    style_tags: { type: "array", items: { type: "string" }, maxItems: 8 },
    garment_ids: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
    rationale: { type: "string" }
  }
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = getRequestId(req);

  try {
    const { user, userClient, serviceClient } = await requireUser(req);
    const body = await readJson<GenerateBody>(req);

    const { data: profile, error: profileError } = await serviceClient
      .from("users")
      .select("subscription_tier, style_preferences")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new HttpError(404, "Profile not found", "NOT_FOUND");
    if (profile.subscription_tier !== "premium") {
      throw new HttpError(402, "AI outfits are premium", "PREMIUM_REQUIRED");
    }

    await assertRateLimit(userClient, "ai:generate_outfit", 12, 60 * 60 * 24 * 7);

    const { data: garments, error: garmentsError } = await serviceClient
      .from("garments")
      .select("id, category, subcategory, style, season, material, pattern, fit, gender_style, occasion, color_primary, color_secondary, ai_tags")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .limit(120);

    if (garmentsError) throw garmentsError;
    if (!garments || garments.length < 2) {
      throw new HttpError(400, "At least two garments are required", "NOT_ENOUGH_GARMENTS");
    }

    const closetSummary = garments.map((g) => ({
      id: g.id,
      category: g.category,
      subcategory: g.subcategory,
      style: g.style,
      season: g.season,
      material: g.material,
      pattern: g.pattern,
      fit: g.fit,
      color_primary: g.color_primary,
      color_secondary: g.color_secondary,
      tags: g.ai_tags
    }));

    const model = Deno.env.get("CLOSETLY_TEXT_MODEL") ?? "gpt-5.4-mini";
    const promptHash = await sha256(JSON.stringify({ body, closetSummary }));
    const response = await createResponse({
      model,
      input: [
        {
          role: "system",
          content:
            "You are a practical fashion stylist. Create one cohesive outfit using only garment IDs provided by the user."
        },
        {
          role: "user",
          content: JSON.stringify({
            occasion: body.occasion ?? "casual",
            season: body.season,
            style_preferences: profile.style_preferences,
            garments: closetSummary
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "generated_outfit",
          strict: true,
          schema: outfitSchema
        }
      }
    });

    const generated = JSON.parse(extractOutputText(response)) as GeneratedOutfit;
    const validIds = new Set(garments.map((g) => g.id));
    const garmentIds = generated.garment_ids.filter((id) => validIds.has(id)).slice(0, 6);

    if (garmentIds.length < 2) {
      throw new HttpError(422, "Model returned invalid garment_ids", "INVALID_AI_OUTPUT");
    }

    const { data: outfit, error: outfitError } = await serviceClient
      .from("outfits")
      .insert({
        user_id: user.id,
        name: generated.name,
        notes: generated.rationale,
        season: generated.season,
        style_tags: generated.style_tags,
        occasion: generated.occasion,
        is_ai_generated: true,
        ai_prompt_hash: promptHash
      })
      .select("*")
      .single();

    if (outfitError) throw outfitError;

    const links = garmentIds.map((garmentId, index) => ({
      outfit_id: outfit.id,
      garment_id: garmentId,
      position: index
    }));

    const linkInsert = await serviceClient.from("outfit_garments").insert(links);
    if (linkInsert.error) throw linkInsert.error;

    await serviceClient.from("analytics_events").insert({
      user_id: user.id,
      event_name: "ai_outfit_generated",
      source: "edge",
      request_id: requestId,
      properties: { model, garment_count: garmentIds.length }
    });

    log("info", "outfit generated", { requestId, userId: user.id, outfitId: outfit.id, model });
    return json({ status: "created", outfit }, 200, requestId);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : "UNEXPECTED_ERROR";
    log("error", "generate outfit failed", { requestId, error: String(error) });
    return json({ error: String(error), code, requestId }, status, requestId);
  }
});
