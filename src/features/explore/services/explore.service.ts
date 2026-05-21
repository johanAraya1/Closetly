import { supabase } from "@/services/supabase";
import type { ExploreGarment } from "@/types";

export type ExplorePage = {
  items: ExploreGarment[];
  nextCursor: string | null;
};

export const listExploreGarments = async (cursor?: string | null): Promise<ExplorePage> => {
  let query = supabase
    .from("public_garments_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(24);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []) as ExploreGarment[];

  return {
    items,
    nextCursor: items.length === 24 ? items[items.length - 1].created_at : null
  };
};

export const favoriteGarment = async (garmentId: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User session required");

  const { error } = await supabase.from("favorites").upsert({
    user_id: user.user.id,
    target_type: "garment",
    target_id: garmentId
  });

  if (error) throw error;
};
