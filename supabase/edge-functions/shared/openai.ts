import { HttpError } from "./http.ts";

const OPENAI_URL = "https://api.openai.com/v1";

export const extractOutputText = (payload: Record<string, unknown>) => {
  if (typeof payload.output_text === "string") return payload.output_text;

  const output = payload.output;
  if (!Array.isArray(output)) return "";

  for (const item of output) {
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      const maybe = part as { type?: string; text?: string };
      if ((maybe.type === "output_text" || maybe.type === "text") && maybe.text) {
        return maybe.text;
      }
    }
  }

  return "";
};

export const createResponse = async (body: Record<string, unknown>) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new HttpError(500, "OPENAI_API_KEY is not configured", "OPENAI_NOT_CONFIGURED");

  const response = await fetch(`${OPENAI_URL}/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(response.status, JSON.stringify(payload), "OPENAI_REQUEST_FAILED");
  }

  return payload as Record<string, unknown>;
};

export const createEmbedding = async (input: string) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new HttpError(500, "OPENAI_API_KEY is not configured", "OPENAI_NOT_CONFIGURED");

  const response = await fetch(`${OPENAI_URL}/embeddings`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: Deno.env.get("CLOSETLY_EMBEDDING_MODEL") ?? "text-embedding-3-small",
      input
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(response.status, JSON.stringify(payload), "OPENAI_EMBEDDING_FAILED");
  }

  return (payload as { data: Array<{ embedding: number[] }> }).data[0].embedding;
};

export const sha256 = async (input: string) => {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};
