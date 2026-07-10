"use client";

import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";
import { Reveal } from "./reveal";

const cardVariants = {
  base:
    "bg-mistral-canvas border border-mistral-hairline-soft",
  feature:
    "bg-mistral-canvas border border-mistral-hairline-soft",
  cream:
    "bg-mistral-cream border border-mistral-beige-deep",
  "cream-soft":
    "bg-mistral-surface-cream-soft",
  "feature-product":
    "bg-mistral-canvas border border-mistral-hairline-soft shadow-mistral-level-2",
  photographic:
    "bg-mistral-surface-code text-mistral-on-dark",
} as const;

type CardVariant = keyof typeof cardVariants;

function MarketingCard({
  className,
  variant = "base",
  padding = "xl",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: CardVariant;
  padding?: "md" | "xl" | "xxl";
}) {
  const paddingMap = {
    md: "p-6",
    xl: "p-6 md:p-8",
    xxl: "p-8 md:p-10",
  };

  return (
    <Reveal direction="up" duration={300}>
      <div
        className={cn(
          "rounded-xl transition-shadow duration-200 hover:shadow-mistral-level-2",
          cardVariants[variant],
          paddingMap[padding],
          variant === "photographic" && "p-0",
          className
        )}
        data-slot="marketing-card"
        data-variant={variant}
        {...props}
      />
    </Reveal>
  );
}

export { MarketingCard, type CardVariant };
