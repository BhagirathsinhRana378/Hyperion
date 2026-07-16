"use client";

import { useAuth } from "@clerk/clerk-react";
import { useRouter } from "@workspace/i18n/navigation";
import { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/** Resolved at build time by Next.js env replacement. */
const hasClerkPublishableKey = !!(
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export function AuthProvider({ children }: AuthProviderProps) {
  // When Clerk isn't configured (CI / fresh clone / static export build)
  // skip auth entirely so the build doesn't crash.
  if (!hasClerkPublishableKey) {
    return <>{children}</>;
  }

  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return <>{children}</>;
}
