"use client";

import { cn } from "@workspace/ui/lib/utils";

interface GradientBandProps {
  className?: string;
  variant?: "full" | "thin";
}

/**
 * GradientBand — a single soft primary-tinted line marking the
 * transition from page content into the footer. Kept to one accent
 * color to stay consistent with the dark, minimal marketing palette.
 */
export function GradientBand({
  variant = "full",
  className,
}: GradientBandProps) {
  return (
    <div
      aria-hidden={true}
      className={cn(
        variant === "full"
          ? "h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          : "h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent",
        className
      )}
      data-slot="gradient-band"
      data-variant={variant}
    />
  );
}
