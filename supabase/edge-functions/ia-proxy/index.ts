import { json } from "../shared/http.ts";

Deno.serve(() =>
  json(
    {
      status: "moved",
      message: "Use analyze-garment for garment metadata or generate-outfit for premium outfits."
    },
    410
  )
);
