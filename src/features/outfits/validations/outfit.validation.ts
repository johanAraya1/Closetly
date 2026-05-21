import { z } from "zod";

export const outfitSchema = z.object({
  name: z.string().min(1).max(80),
  notes: z.string().max(300).optional(),
  season: z.string().max(40).optional(),
  occasion: z.string().max(60).optional(),
  garment_ids: z.array(z.string().uuid()).min(1).max(12)
});

export type OutfitInput = z.infer<typeof outfitSchema>;
