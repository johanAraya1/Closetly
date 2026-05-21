import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import type { UserProfile } from "@/types";

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isReady: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setReady: (isReady: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isReady: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setReady: (isReady) => set({ isReady }),
  reset: () => set({ session: null, user: null, profile: null })
}));
