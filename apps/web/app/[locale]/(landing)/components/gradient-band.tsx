"use client";

import { cn } from "@workspace/ui/lib/utils";

interface GradientBandProps {
  variant?: "full" | "thin";
  className?: string;
}

/**
 * GradientBand — The signature sunset gradient stripe.
 * Full variant: multi-stop orange→yellow→cream gradient band.
 * Thin variant: single orange line.
 * Use full on Product/Coding pages; thin on Services/Contact.
 */
export function GradientBand({ variant = "full", className }: GradientBandProps) {
  return (
    <div
      aria-hidden={true}
      className={cn(
        variant === "full"
          ? "h-2 bg-gradient-to-r from-mistral-primary via-mistral-sunshine-700 via-mistral-sunshine-500 via-mistral-yellow-saturated to-mistral-cream"
          : "h-[2px] bg-gradient-to-r from-mistral-primary/60 via-mistral-primary to-mistral-primary/60",
        className
      )}
      data-slot="gradient-band"
      data-variant={variant}
    />
  );
}
