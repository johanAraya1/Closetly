import { create } from "zustand";
import { supabase } from "@services/supabase";

type AuthState = {
  session: any | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; username: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ session: data.session });
  },
  register: async ({ email, password, username }) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) throw error;
    set({ session: data.session });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  }
}));
