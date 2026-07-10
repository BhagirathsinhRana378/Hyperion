"use client";

import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

const badgeVariants = {
  orange:
    "bg-mistral-primary text-mistral-on-primary",
  cream:
    "bg-mistral-cream-deeper text-mistral-ink",
  dark:
    "bg-mistral-ink text-mistral-on-dark",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

function Badge({
  className,
  variant = "orange",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-[10px] py-[4px] text-caption-bold",
        badgeVariants[variant],
        className
      )}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  );
}

export { Badge, type BadgeVariant };
