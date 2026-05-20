import { serve } from "std/server";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json();
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      return new Response(JSON.stringify({ error: "Missing OpenAI key" }), { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: body.messages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
