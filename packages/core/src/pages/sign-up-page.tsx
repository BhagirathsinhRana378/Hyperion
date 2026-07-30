"use client";

import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

/** Resolved at build time by Next.js env replacement. */
const hasClerkPublishableKey = !!(
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export function SignUpPage() {
  if (!hasClerkPublishableKey) {
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
      <SignUp
        appearance={{
          baseTheme: dark,
          variables: {
            colorBackground: "#18181b",
            colorText: "#f4f4f5",
            colorTextSecondary: "#a1a1aa",
            colorInputBackground: "#09090b",
            colorInputText: "#f4f4f5",
          },
        }}
        routing="hash"
      />
    </div>
  );
}
