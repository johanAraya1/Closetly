import { useEffect } from "react";
import * as Updates from "expo-updates";

export const useOtaUpdates = () => {
  useEffect(() => {
    let isMounted = true;

    const applyAvailableUpdate = async () => {
      if (__DEV__ || !Updates.isEnabled) return;

      try {
        const update = await Updates.checkForUpdateAsync();
        if (!isMounted || !update.isAvailable) return;

        await Updates.fetchUpdateAsync();
        if (isMounted) await Updates.reloadAsync();
      } catch {
        // Keep startup resilient if the device is offline or EAS Update is unavailable.
      }
    };

    void applyAvailableUpdate();

    return () => {
      isMounted = false;
    };
  }, []);
};
