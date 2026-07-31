"use client";

import { useAuth } from "@clerk/clerk-react";
import { siteConfig } from "@workspace/core/config/site";
import { useAuthStore } from "@workspace/core/stores/auth-store";
import { useRouter } from "@workspace/i18n/navigation";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/** Resolved at build time by Next.js env replacement. */
const hasClerkPublishableKey = !!(
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

const isNativeApp =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_IS_NATIVE === "true";

function NativeAuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoaded, initAuth } = useAuthStore();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    initAuth();

    const handleFocus = () => {
      initAuth();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [initAuth]);

  const handleSignIn = async () => {
    setConnecting(true);
    const webUrl =
      process.env.NEXT_PUBLIC_WEB_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3002"
        : siteConfig.links.website);

    const authUrl = `${webUrl}/auth/app-login?port=8787`;

    try {
      if (
        typeof window !== "undefined" &&
        ("__TAURI__" in window || "__TAURI_INTERNALS__" in window)
      ) {
        let opened = false;
        try {
          const { openUrl } = await import("@tauri-apps/plugin-opener");
          await openUrl(authUrl);
          opened = true;
        } catch (err) {
          console.warn(
            "Plugin opener error, falling back to Rust command:",
            err
          );
        }

        if (!opened) {
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("open_browser", { url: authUrl });
        }
      } else {
        window.open(authUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to open browser:", err);
      window.open(authUrl, "_blank");
    } finally {
      setTimeout(() => setConnecting(false), 3000);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex w-full max-w-md flex-col items-center space-y-6 rounded-2xl border bg-card p-8 text-center text-card-foreground shadow-lg">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-2xl tracking-tight">
              Sign in to Hyperion
            </h1>
            <p className="text-muted-foreground text-sm">
              Authentication is safely handled via the Hyperion web portal.
              Click below to connect your session.
            </p>
          </div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            disabled={connecting}
            onClick={handleSignIn}
            type="button"
          >
            {connecting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ExternalLink className="size-5" />
            )}
            {connecting ? "Opening Browser..." : "Sign In with Web Portal"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ClerkAuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  if (!isNativeApp && hasClerkPublishableKey) {
    return <ClerkAuthGate>{children}</ClerkAuthGate>;
  }

  return <NativeAuthGate>{children}</NativeAuthGate>;
}
