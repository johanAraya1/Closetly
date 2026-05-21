import { useEffect } from "react";

import { getProfile } from "@/features/auth/services/auth.service";
import { identifyUser, track } from "@/services/analytics";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/useAuthStore";

export const useAuthBootstrap = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setReady = useAuthStore((state) => state.setReady);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);

      if (data.session?.user) {
        const profile = await getProfile(data.session.user.id);
        if (mounted) {
          setProfile(profile);
          await identifyUser(data.session.user.id, { username: profile?.username });
        }
      }

      setReady(true);
    };

    void load();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
        await track(`auth_${event.toLowerCase()}`, { userId: session.user.id });
      } else {
        setProfile(null);
      }
      setReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setProfile, setReady, setSession]);
};
