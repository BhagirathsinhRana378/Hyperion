"use client";

import { useAuth, useUser } from "@clerk/clerk-react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AppCallbackInner() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { sessionId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const port = searchParams.get("port") || "8787";
  const [transferred, setTransferred] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn || !user) {
        router.push(`/auth/app-login?port=${port}`);
        return;
      }

      const email = user.primaryEmailAddress?.emailAddress || "";
      const userId = user.id;
      const name = user.fullName || user.username || "";
      const avatar = user.imageUrl || "";

      const callbackUrl = new URL(`http://localhost:${port}/auth/callback`);
      callbackUrl.searchParams.set("session_id", sessionId || userId);
      callbackUrl.searchParams.set("user_id", userId);
      callbackUrl.searchParams.set("email", email);
      if (name) callbackUrl.searchParams.set("name", name);
      if (avatar) callbackUrl.searchParams.set("avatar", avatar);

      setTransferred(true);
      window.location.href = callbackUrl.toString();
    }
  }, [isLoaded, isSignedIn, user, sessionId, port, router]);

  return (
    <div className="relative flex min-h-[calc(100vh-120px)] flex-col items-center justify-center overflow-hidden bg-background px-4 pt-32 pb-24 text-center text-foreground">
      {/* Background glow effects matching Hyperion theme */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center space-y-6 rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          {transferred ? (
            <CheckCircle2 className="size-8 text-green-500 animate-pulse" />
          ) : (
            <ShieldCheck className="size-8" />
          )}
        </div>
        <div className="space-y-2">
          <h1 className="font-bold font-display text-2xl text-foreground">
            {transferred ? "Session Transferred!" : "Connecting Desktop App..."}
          </h1>
          <p className="mx-auto max-w-xs text-muted-foreground text-sm">
            {transferred
              ? "Your authentication session was successfully transferred to your Hyperion desktop application."
              : "Connecting to local application callback endpoint."}
          </p>
        </div>
        {!transferred && (
          <div className="flex items-center gap-2 font-semibold text-primary text-xs">
            <Loader2 className="size-4 animate-spin" />
            <span>Redirecting to local client...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center pt-24 pb-16">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <AppCallbackInner />
    </Suspense>
  );
}
