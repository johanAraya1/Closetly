import type { Garment } from "@/types";

export type CreateGarmentPayload = {
  image_url: string;
  thumbnail_url: string;
  storage_path: string;
  thumbnail_path: string;
  file_hash: string;
  file_size?: number;
  aspect_ratio?: number;
  name?: string;
};

export type GarmentListItem = Garment;
