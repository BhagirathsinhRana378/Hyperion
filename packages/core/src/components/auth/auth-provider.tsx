"use client";

import { useAuthStore } from "@workspace/core/stores/auth-store";
import { useRouter } from "@workspace/i18n/navigation";
import { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, loading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!(loading || user)) {
      router.push("/sign-in");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
