import { supabase } from "@/services/supabase";
import type { UserProfile } from "@/types";
import { normalizeUsername } from "@/utils/sanitize";

import type { LoginInput, RegisterInput } from "../validations/auth.validation";

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data as UserProfile | null;
};

export const signIn = async ({ email, password }: LoginInput) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async ({ email, password, username }: RegisterInput) => {
  const normalized = normalizeUsername(username);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: normalized
      }
    }
  });

  if (error) throw error;

  if (data.user) {
    await supabase.from("users").upsert({
      id: data.user.id,
      email,
      username: normalized,
      language: "es"
    });
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
