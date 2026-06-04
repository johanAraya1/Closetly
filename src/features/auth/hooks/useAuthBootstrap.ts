import { useEffect } from "react";

import { isConfigured } from "@/constants/env";
import { getProfile } from "@/features/auth/services/auth.service";
import { identifyUser, track } from "@/services/analytics";
import { captureError } from "@/services/observability";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/useAuthStore";

export const useAuthBootstrap = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setReady = useAuthStore((state) => state.setReady);

  useEffect(() => {
    let mounted = true;

    if (!isConfigured) {
      setSession(null);
      setProfile(null);
      setReady(true);
      return;
    }

    const load = async () => {
      try {
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
      } catch (error) {
        captureError(error, { scope: "auth_bootstrap" });
        if (mounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setReady(true);
      }
    };

    void load();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session);
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setProfile(profile);
          await track(`auth_${event.toLowerCase()}`, { userId: session.user.id });
        } else {
          setProfile(null);
        }
      } catch (error) {
        captureError(error, { scope: "auth_state_change" });
        setProfile(null);
      } finally {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setProfile, setReady, setSession]);
};
