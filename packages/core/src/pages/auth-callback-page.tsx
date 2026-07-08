"use client";

import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@workspace/core/lib/supabase";
import { useEffect } from "react";

export function AuthCallbackPage() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (session) {
          window.location.href = "/home";
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">Signing you in...</p>
    </div>
  );
}
