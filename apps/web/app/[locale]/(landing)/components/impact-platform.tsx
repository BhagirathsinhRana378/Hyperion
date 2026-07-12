"use client";

/**
 * Horizontal anchor for the whole beam system (falling column + impact
 * platform). The devs grid is 4 equal columns on sm+, so the seam
 * between the 3rd and 4th cards sits at 75% of the grid's inner width —
 * every beam element lives inside a matching `max-w-6xl px-6` band and
 * pins to this line, so the beam reads as falling straight down the gap
 * between the third and fourth developer. On mobile the grid collapses
 * to 2 columns, so we just center it.
 */
const BEAM_ANCHOR = "left-1/2 sm:left-[75%]";

/** Shared centered band that mirrors the devs grid container
 * (`mx-auto max-w-6xl px-6`) so anything pinned to BEAM_ANCHOR inside
 * it lands exactly on the third card's column, at any viewport width. */
function BeamBand({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 mx-auto w-full max-w-6xl px-6 ${className ?? ""}`}
    >
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/**
 * ImpactBase — the large rounded panel the beam lands on. Instead of a
 * free-floating pedestal, the falling beam strikes the TOP EDGE of a
 * wide rounded container (the "reveal box" pattern): a bright hotspot
 * where the beam meets the edge, light spreading horizontally along
 * that edge, the rounded top corners catching the glow, and a dotted
 * futuristic interior receding below. Sits just above the site footer
 * in normal flow, pulled up slightly so its top edge overlaps the
 * beam's landing point. Everything beam-aligned is pinned to the third
 * card via BEAM_ANCHOR + BeamBand.
 */
export function ImpactBase() {
  return (
    <div aria-hidden={true} className="relative -mt-16">
      {/* The panel. rounded-t only + border-b-0 so it rises out of the
          page and melts into the footer below rather than reading as a
          closed card. */}
      <div className="relative mx-auto h-[48vh] min-h-[360px] max-w-[1700px] overflow-hidden rounded-t-[44px] border border-white/[0.07] border-b-0 shadow-[inset_0_1px_0_0] shadow-white/[0.12]">
        {/* impact wash bleeding down into the interior from the strike */}
        <div className="absolute inset-0 [background:radial-gradient(80%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_7%,transparent),transparent_60%)] sm:[background:radial-gradient(70%_60%_at_75%_0%,color-mix(in_oklab,var(--color-primary)_8%,transparent),transparent_60%)]" />

        {/* dotted futuristic floor, densest under the beam, fading out */}
        <div
          className="absolute inset-0 opacity-50 [mask-image:radial-gradient(110%_100%_at_50%_0%,#000_18%,transparent_72%)] sm:[mask-image:radial-gradient(95%_100%_at_75%_0%,#000_18%,transparent_72%)]"
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

      {/* Beam-landing glows — children of the (overflow-visible) root so
          they can bleed UPWARD off the panel's top edge into the falling
          shaft. Pinned to the third card, so the strike lands where the
          beam actually falls. */}
      <BeamBand className="top-0 z-20">
        {/* strike pinned to the 3rd/4th card seam, where the beam falls */}
        <div className={`absolute top-0 ${BEAM_ANCHOR}`}>
          {/* light spreading horizontally along the top edge */}
          <div className="absolute h-1 w-[42rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-md" />
          {/* crisp hotspot right at the strike */}
          <div className="absolute h-[3px] w-80 max-w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-[1px]" />
          {/* volumetric bloom + fog rising off the edge */}
          <div className="landing-glow-breathe absolute h-44 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-primary/25 blur-3xl" />
          <div className="absolute h-20 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-white/40 blur-2xl" />
        </div>
      </BeamBand>
    </div>
  );
}
