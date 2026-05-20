export type UserProfile = {
  id: string;
  email: string;
  username: string;
  photo_url?: string;
  bio?: string;
  language: string;
  is_private: boolean;
  style_preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Garment = {
  id: string;
  user_id: string;
  image_url: string;
  thumbnail_url?: string;
  name?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  color_primary?: string;
  color_secondary?: string;
  dominant_palette?: string[];
  detected_type?: string;
  confidence_score?: number;
  style_tags?: string[];
  season?: string;
  material?: string;
  pattern?: string;
  background_removed_url?: string;
  visibility: "private" | "public" | "sale" | "trade" | "gift";
  allow_trade: boolean;
  allow_gift: boolean;
  allow_sale: boolean;
  likes_count: number;
  saves_count: number;
  wear_count: number;
  last_worn_date?: string;
  storage_path?: string;
  file_size?: number;
  aspect_ratio?: number;
  created_at: string;
  updated_at: string;
};

export type Outfit = {
  id: string;
  user_id: string;
  name: string;
  season?: string;
  style_tags?: string[];
  is_public: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export type Chat = {
  id: string;
  updated_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  status: string;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: string;
  type: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};
