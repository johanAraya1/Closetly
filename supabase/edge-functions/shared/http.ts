import { corsHeaders } from "./cors.ts";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "EDGE_ERROR"
  ) {
    super(message);
  }
}

export const json = (body: unknown, status = 200, requestId?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
      ...(requestId ? { "x-request-id": requestId } : {})
    }
  });

export const readJson = async <T>(req: Request): Promise<T> => {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body", "INVALID_JSON");
  }
};

export const getRequestId = (req: Request) => req.headers.get("x-request-id") ?? crypto.randomUUID();
