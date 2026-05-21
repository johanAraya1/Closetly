import { z } from "zod";

export const garmentMetadataSchema = z.object({
  name: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  subcategory: z.string().max(60).optional(),
  brand: z.string().max(60).optional(),
  style: z.string().max(40).optional(),
  season: z.string().max(40).optional(),
  material: z.string().max(40).optional(),
  pattern: z.string().max(40).optional(),
  fit: z.string().max(40).optional(),
  gender_style: z.string().max(40).optional(),
  occasion: z.string().max(60).optional(),
  visibility: z.enum(["private", "public", "trade", "sale", "gift"]).default("private"),
  allow_trade: z.boolean().default(false),
  allow_sale: z.boolean().default(false),
  allow_gift: z.boolean().default(false)
});

export type GarmentMetadataInput = z.infer<typeof garmentMetadataSchema>;
