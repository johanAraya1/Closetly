export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Visibility = "private" | "public" | "trade" | "sale" | "gift";
export type SubscriptionTier = "free" | "premium";
export type AiStatus = "pending" | "processing" | "complete" | "failed" | "skipped";
export type ReportTargetType = "user" | "garment" | "outfit" | "message";
export type NotificationType = "message" | "like" | "trade" | "follow" | "system";

export type UserProfile = {
  id: string;
  email: string | null;
  username: string;
  display_name: string | null;
  photo_url: string | null;
  bio: string | null;
  language: "es" | "en";
  is_private: boolean;
  subscription_tier: SubscriptionTier;
  style_preferences: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Garment = {
  id: string;
  user_id: string;
  name: string | null;
  image_url: string;
  thumbnail_url: string | null;
  background_removed_url: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  style: string | null;
  season: string | null;
  material: string | null;
  pattern: string | null;
  fit: string | null;
  gender_style: string | null;
  occasion: string | null;
  dominant_palette: string[];
  color_primary: string | null;
  color_secondary: string | null;
  visibility: Visibility;
  allow_trade: boolean;
  allow_sale: boolean;
  allow_gift: boolean;
  likes_count: number;
  saves_count: number;
  wear_count: number;
  shares_count: number;
  ai_tags: string[];
  confidence_score: number | null;
  similarity_hash: string | null;
  ai_status: AiStatus;
  storage_path: string | null;
  thumbnail_path: string | null;
  file_hash: string | null;
  file_size: number | null;
  aspect_ratio: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Outfit = {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  season: string | null;
  style_tags: string[];
  occasion: string | null;
  is_public: boolean;
  is_ai_generated: boolean;
  likes_count: number;
  saves_count: number;
  wear_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  visibility: Visibility;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Chat = {
  id: string;
  created_by: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  attachment_url: string | null;
  status: "sent" | "delivered" | "read" | "removed";
  created_at: string;
  deleted_at: string | null;
};

export type ExploreGarment = Pick<
  Garment,
  | "id"
  | "user_id"
  | "thumbnail_url"
  | "background_removed_url"
  | "category"
  | "style"
  | "season"
  | "color_primary"
  | "color_secondary"
  | "visibility"
  | "likes_count"
  | "saves_count"
  | "created_at"
>;
