import { api } from "@/services/api";
import { supabase } from "@/services/supabase";
import type { Garment } from "@/types";

import type { CreateGarmentPayload } from "../types";
import type { GarmentMetadataInput } from "../validations/garment.validation";

const ORIGINAL_BUCKET = "garment-originals";
const THUMBNAIL_BUCKET = "garment-thumbnails";

const uploadImage = async (bucket: string, path: string, uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false
  });

  if (error) throw error;
};

export const listMyGarments = async (): Promise<Garment[]> => {
  const { data, error } = await supabase
    .from("garments")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw error;
  return (data ?? []) as Garment[];
};

export const findDuplicateGarment = async (fileHash: string, userId: string) => {
  const { data, error } = await supabase
    .from("garments")
    .select("id")
    .eq("user_id", userId)
    .eq("file_hash", fileHash)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const uploadGarmentAssets = async (userId: string, fileHash: string, originalUri: string, thumbnailUri: string) => {
  const originalPath = `${userId}/originals/${fileHash}.webp`;
  const thumbnailPath = `${userId}/thumbs/${fileHash}.webp`;

  await uploadImage(ORIGINAL_BUCKET, originalPath, originalUri);
  await uploadImage(THUMBNAIL_BUCKET, thumbnailPath, thumbnailUri);

  const thumbnailPublicUrl = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(thumbnailPath).data.publicUrl;

  return {
    originalPath,
    thumbnailPath,
    thumbnailPublicUrl
  };
};

export const createGarment = async (payload: CreateGarmentPayload): Promise<Garment> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("User session required");

  const { data, error } = await supabase
    .from("garments")
    .insert({
      ...payload,
      user_id: userData.user.id,
      ai_status: "pending"
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Garment;
};

export const updateGarmentMetadata = async (garmentId: string, input: GarmentMetadataInput) => {
  const { data, error } = await supabase
    .from("garments")
    .update(input)
    .eq("id", garmentId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Garment;
};

export const analyzeGarment = async (garmentId: string) => {
  const { data } = await api.post("analyze-garment", { garment_id: garmentId });
  return data as { status: "complete" | "cached" | "queued"; garment?: Garment };
};

export const removeGarmentBackground = async (garmentId: string) => {
  const { data } = await api.post("remove-bg-proxy", { garment_id: garmentId });
  return data as { status: string; background_removed_url?: string };
};
