"use client";

import { SignIn, useUser } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Laptop, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const hasClerkPublishableKey = !!(
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

function AppLoginInnerWithClerk() {
  const { isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const port = searchParams.get("port") || "8787";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = `/auth/app-callback?port=${port}`;
    }
  }, [isLoaded, isSignedIn, port]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center pt-24 pb-16">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-120px)] flex-col items-center justify-center overflow-hidden bg-background px-4 pt-32 pb-24 text-foreground">
      {/* Background ambient glow matching Hyperion design system */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="relative z-10 w-full max-w-md space-y-6 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 font-semibold text-primary text-xs backdrop-blur-md">
            <Laptop className="size-4" />
            <span>Desktop Client Authentication</span>
          </div>
          <h1 className="font-bold font-display text-3xl text-foreground tracking-tight sm:text-4xl">
            Connect Desktop App
          </h1>
          <p className="max-w-sm text-muted-foreground text-sm sm:text-base">
            Sign in to securely transfer your authentication session to your
            Hyperion desktop client.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <SignIn
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: "#18181b",
                colorText: "#f4f4f5",
                colorTextSecondary: "#a1a1aa",
                colorInputBackground: "#09090b",
                colorInputText: "#f4f4f5",
              },
              elements: {
                card: "bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md",
                headerTitle: "text-zinc-100 font-bold text-xl font-display",
                headerSubtitle: "text-zinc-400 text-sm",
                socialButtonsBlockButton:
                  "border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-100 font-medium rounded-xl transition-all",
                socialButtonsBlockButtonText:
                  "text-zinc-100 font-medium text-sm",
                formButtonPrimary:
                  "bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-md py-2.5",
                formFieldInput:
                  "bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-2.5",
                formFieldLabel: "text-zinc-200 font-medium text-sm",
                footerActionLink: "text-primary hover:underline font-medium",
                footerActionText: "text-zinc-400 text-sm",
                footer: "bg-transparent border-t border-zinc-800/60 pt-4",
                dividerLine: "bg-zinc-800",
                dividerText: "text-zinc-400 text-xs uppercase tracking-wider",
              },
            }}
            fallbackRedirectUrl={`/auth/app-callback?port=${port}`}
            forceRedirectUrl={`/auth/app-callback?port=${port}`}
            routing="hash"
            signUpForceRedirectUrl={`/auth/app-callback?port=${port}`}
          />
        </div>
      </div>
    </div>
  );
}

function AppLoginFallback() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-4 text-center">
      <p className="text-muted-foreground text-sm">
        Authentication is not configured (missing
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).
      </p>
    </div>
  );
}

function AppLoginInner() {
  if (!hasClerkPublishableKey) {
    return <AppLoginFallback />;
  }
  return <AppLoginInnerWithClerk />;
}

export default function AppLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center pt-24 pb-16">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <AppLoginInner />
    </Suspense>
  );
}
