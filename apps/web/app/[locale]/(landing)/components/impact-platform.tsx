"use client";

import { CtaLink } from "./marketing-kit";

/**
 * ImpactBase — the single large rounded panel the LaserFlow beam lands
 * on. The WebGL beam supplies the ONE impact flare (see DevsBackdrop);
 * this panel supplies the catch it lands on — rounded top corners
 * glowing, a wash bleeding into a dotted futuristic interior — plus the
 * page's closing content so the space below the strike isn't empty.
 * Sits just above the footer, pulled up (-mt) so its top edge meets the
 * beam's landing point. Its glow is densest under the beam (75% on sm,
 * the 3rd/4th card seam the LaserFlow is offset to).
 */
export function ImpactBase({ members = [] }: { members?: string[] }) {
  return (
    <div className="relative -mt-1">
      <div className="relative mx-auto h-[54vh] min-h-[440px] max-w-[1700px] overflow-hidden rounded-t-[44px] border border-white/[0.07] border-b-0 shadow-[inset_0_1px_0_0] shadow-white/[0.12]">
        {/* decorative light-catch layers */}
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0"
        >
          {/* wash bleeding down into the interior from the strike */}
          <div className="absolute inset-0 [background:radial-gradient(80%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_7%,transparent),transparent_60%)] sm:[background:radial-gradient(70%_60%_at_60%_0%,color-mix(in_oklab,var(--color-primary)_8%,transparent),transparent_60%)]" />

          {/* dotted futuristic floor, densest under the beam, fading out */}
          <div
            className="absolute inset-0 opacity-50 [mask-image:radial-gradient(110%_100%_at_50%_0%,#000_18%,transparent_72%)] sm:[mask-image:radial-gradient(95%_100%_at_60%_0%,#000_18%,transparent_72%)]"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in oklab, var(--color-border) 65%, transparent) 1px, transparent 1.6px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* rounded top corners catching the light */}
          <div className="absolute top-0 left-0 size-44 [background:radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-primary)_9%,transparent),transparent_70%)]" />
          <div className="absolute top-0 right-0 size-44 [background:radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--color-primary)_9%,transparent),transparent_70%)]" />
        </div>

        {/* Closing content — sits below the strike so the base no longer
            reads as an empty box. */}
        <div className="relative z-10 mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 pt-12 text-center">
          <h2 className="mt-5 text-balance font-display text-3xl text-foreground tracking-tighter md:text-5xl">
            The people behind the beam
          </h2>
          <p className="mt-4 max-w-md text-balance text-muted-foreground">
            Hyperion's agent swarm, terminal grid, execution platform, and
            design system — each owned by one of four founding engineers. Hover
            the light above to meet them.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CtaLink href="/about">Read our story</CtaLink>
            <CtaLink href="/contact" variant="ghost">
              Get in touch
            </CtaLink>
          </div>
          {members.length > 0 && (
            <p className="mt-10 font-mono text-[0.7rem] text-muted-foreground/50 uppercase tracking-[0.35em]">
              {members.join("  ·  ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
