import { useEffect, useState } from "react";

import { AUTH_CHANGE_EVENT, AuthState, getStoredAuth } from "./auth";

export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setAuthState(getStoredAuth());
    };

    syncAuth();
    setIsReady(true);

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "playerId" || event.key === "idToken") {
        syncAuth();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
    };
  }, []);

  return {
    authState,
    isAuthenticated: Boolean(authState),
    isReady,
  };
}
