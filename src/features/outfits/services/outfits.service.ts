import { api } from "@/services/api";
import { supabase } from "@/services/supabase";
import type { Outfit } from "@/types";

export const listMyOutfits = async (): Promise<Outfit[]> => {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw error;
  return (data ?? []) as Outfit[];
};

export const generateAiOutfit = async (occasion?: string) => {
  const { data } = await api.post("generate-outfit", { occasion });
  return data as { status: "created"; outfit: Outfit };
};
