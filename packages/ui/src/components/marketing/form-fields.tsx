"use client";

import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

export function MarketingInput({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<"input"> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className="text-body-sm-medium text-mistral-ink"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <input
        className={cn(
          "h-[44px] w-full rounded-md border border-mistral-hairline-strong bg-mistral-canvas px-4 py-3 text-body-md text-mistral-ink placeholder:text-mistral-muted",
          "focus:border-2 focus:border-mistral-primary focus:outline-none",
          className
        )}
        data-slot="marketing-input"
        id={id}
        {...props}
      />
    </div>
  );
}

export function MarketingTextarea({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<"textarea"> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className="text-body-sm-medium text-mistral-ink"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "min-h-[120px] w-full rounded-md border border-mistral-hairline-strong bg-mistral-canvas px-4 py-3 text-body-md text-mistral-ink placeholder:text-mistral-muted",
          "focus:border-2 focus:border-mistral-primary focus:outline-none",
          className
        )}
        data-slot="marketing-textarea"
        id={id}
        {...props}
      />
    </div>
  );
}
