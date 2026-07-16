"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  // Falls back to "" when no env var is set (CI, forks, fresh clones).
  // Clerk's SDK handles an empty key gracefully during SSR/build
  // by providing safe null defaults for all auth hooks.
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  return (
    <BaseClerkProvider publishableKey={publishableKey}>
      {children}
    </BaseClerkProvider>
  );
}
