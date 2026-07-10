"use client";

import { cn } from "@workspace/ui/lib/utils";

/**
 * GradientBlock — A sunset-themed placeholder for missing imagery.
 * Use wherever real photography / product screenshots are not yet available.
 * Mark with: // TODO: replace with real asset
 */
export function GradientBlock({
  className,
  label,
  aspectRatio = "16/9",
}: {
  className?: string;
  label?: string;
  aspectRatio?: string;
}) {
  return (
    <div
      aria-label={label ?? "Placeholder image"}
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-mistral-sunshine-700 via-mistral-sunshine-900 to-mistral-primary text-mistral-on-primary text-caption text-center",
        className
      )}
      data-slot="gradient-block"
      style={{ aspectRatio }}
    >
      <span className="px-4 py-2">
        {label ?? "TODO: replace with real asset"}
      </span>
    </div>
  );
}
