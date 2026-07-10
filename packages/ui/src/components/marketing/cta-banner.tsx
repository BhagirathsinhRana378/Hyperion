"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import type * as React from "react";
import { Reveal } from "./reveal";

interface CTABannerProps extends React.ComponentProps<"section"> {
  headline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Use dark buttons instead of primary-orange */
  dark?: boolean;
}

export function CTABanner({
  className,
  headline = "Ready to get started?",
  description,
  ctaLabel = "Get started",
  ctaHref = "/contact",
  dark = false,
  ...props
}: CTABannerProps) {
  return (
    <Reveal direction="up" duration={350}>
      <section
        className={cn(
          "mx-auto max-w-7xl rounded-xl bg-mistral-cream px-8 py-section md:py-section-lg",
          className
        )}
        data-slot="cta-banner"
        {...props}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-heading-1 text-mistral-ink">
            {headline}
          </h2>
          {description && (
            <p className="mt-6 text-subtitle text-mistral-slate">
              {description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {dark ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-mistral-ink px-5 text-button-md text-mistral-on-dark transition-colors duration-150 hover:bg-mistral-charcoal"
                href={ctaHref}
              >
                {ctaLabel}
              </Link>
            ) : (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-mistral-primary px-5 text-button-md text-mistral-on-primary transition-colors duration-150 hover:bg-mistral-primary-deep"
                href={ctaHref}
              >
                {ctaLabel}
              </Link>
            )}
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-mistral-hairline-strong bg-transparent px-5 text-button-md text-mistral-ink transition-colors duration-150 hover:bg-mistral-surface"
              href="/contact"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
