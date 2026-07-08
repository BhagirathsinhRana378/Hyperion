"use client";

import { useAuthStore } from "@workspace/core/stores/auth-store";
import { useEffect } from "react";

export function useAuth() {
  const { initialize, loading, session, signOut, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return { loading, session, signOut, user };
}
