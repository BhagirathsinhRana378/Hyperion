"use client";

import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignUp routing="hash" />
    </div>
  );
}
