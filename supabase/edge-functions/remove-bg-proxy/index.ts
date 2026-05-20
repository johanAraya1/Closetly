import { serve } from "std/server";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json();
    const removeBgKey = Deno.env.get("REMOVE_BG_API_KEY");
    if (!removeBgKey) {
      return new Response(JSON.stringify({ error: "Missing remove.bg key" }), { status: 500 });
    }

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${removeBgKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image_url: body.image_url, size: "medium" })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
