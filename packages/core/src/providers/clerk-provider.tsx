"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  // Falls back to "" when no env var is set (CI, forks, fresh clones).
  // During static export builds (native app), Clerk's SDK throws
  // "Missing publishableKey" if the provider is mounted with an empty key
  // and any child calls useAuth(). When the key is absent we skip the
  // Clerk wrapper entirely so the build doesn't fail in CI / forks.
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider publishableKey={publishableKey}>
      {children}
    </BaseClerkProvider>
  );
}
