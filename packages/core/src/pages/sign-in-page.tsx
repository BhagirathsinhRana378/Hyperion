"use client";

import { SignIn } from "@clerk/clerk-react";

/** Resolved at build time by Next.js env replacement. */
const hasClerkPublishableKey = !!(
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export function SignInPage() {
  if (!hasClerkPublishableKey) {
    // During CI / static export builds Clerk isn't configured.
    // Show a minimal placeholder instead of crashing the build.
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <p className="text-muted-foreground text-sm">
          Authentication is not configured.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignIn routing="hash" />
    </div>
  );
}
