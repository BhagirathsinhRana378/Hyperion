"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

/* three is client-only — split it out of the main bundle; the page
   renders instantly and the beam fades in when the chunk arrives. */
const LaserFlow = dynamic(() => import("./laser-flow"), { ssr: false });

/**
 * DevsBackdrop — the full vertical run of the devs page's energy
 * beam. Fills whatever height its parent stage has (`absolute
 * inset-0`), and that stage is deliberately very tall (see
 * devs/page.tsx: hero → hidden dev zones → a long fall → the impact
 * platform) so the beam reads as one continuous shaft rather than a
 * blob behind a card grid.
 *
 * LaserFlow's shader normalizes its coordinate space to the
 * container's aspect ratio, not its pixel size — so simply making the
 * stage taller stretches the same beam pattern taller for free; no
 * extra "length" prop is needed to make it feel massive.
 * `verticalBeamOffset` shifts the shader's natural zero point (where
 * the beam would otherwise center) down as a fraction of the
 * container's height — a negative fraction pushes that point toward
 * the bottom, where ImpactBase sits, instead of dead-center.
 *
 * `horizontalBeamOffset` shifts the beam sideways as a fraction of the
 * viewport width from center (uBeamXFrac = screenFraction − 0.5); ~0.2
 * lands it on the seam between the 3rd and 4th dev cards, so the
 * LaserFlow shaft falls straight into ImpactBase's strike glow (pinned
 * to that same seam via BEAM_ANCHOR in impact-platform.tsx). This is the
 * only beam now — the volumetric shaft, wisps, fog, and impact flare all
 * come from this WebGL layer; the earlier CSS beam column was removed.
 */
const BEAM_IMPACT_OFFSET = -0.5;
const BEAM_X_ANCHOR = 0.1;

export interface DevsBackdropProps {
  boosted?: boolean;
  dimmed?: boolean;
}

export function DevsBackdrop({
  boosted = false,
  dimmed = false,
}: DevsBackdropProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden={true}
      className={cn(
        "pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-500 ease-in-out",
        dimmed ? "opacity-15" : "opacity-100"
      )}
    >
      {/* hairline grid + grain — a surface for the beam to blend into
          instead of floating on flat black */}
      <div className="landing-grid-noise absolute inset-0" />

      {/* soft wash bleeding past the top edge — reads as the beam's
          source continuing above the viewport rather than starting
          exactly at this section. Pinned toward the third card so the
          light appears to originate directly above the beam column. */}
      <div className="landing-glow-breathe absolute inset-x-0 -top-24 h-72 [background:radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_75%)] sm:[background:radial-gradient(46%_100%_at_71%_0%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_75%)]" />

      {/* soft vignette so the edges recede and the beam stays the
          brightest thing on screen */}
      <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_20%,transparent_55%,color-mix(in_oklab,var(--color-background)_70%,transparent)_100%)]" />

      {/* drifting dust across the whole beam run */}
      <div className="absolute inset-0 opacity-70">
        {PARTICLES.map((p) => (
          <span
            className="landing-drift absolute size-1 rounded-full bg-primary/50"
            key={p.id}
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                "--drift-x": `${p.driftX}px`,
                "--drift-dur": `${p.duration}s`,
                "--drift-delay": `${p.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {!reduceMotion && (
        <div className="relative mx-auto h-full w-full max-w-screen-2xl px-6">
          <LaserFlow
            className="absolute inset-0"
            color="#EEEEED"
            decay={1.15}
            fogIntensity={0.6}
            horizontalBeamOffset={BEAM_X_ANCHOR}
            horizontalSizing={0.55}
            intensity={boosted ? 1.7 : 1.35}
            style={{ mixBlendMode: "screen" }}
            verticalBeamOffset={BEAM_IMPACT_OFFSET}
            verticalSizing={3.6}
            wispIntensity={6.5}
          />
        </div>
      )}
    </div>
  );
}

interface Particle {
  delay: number;
  driftX: number;
  duration: number;
  id: number;
  x: number;
  y: number;
}

// Deterministic pseudo-random spread so SSR/CSR markup matches — avoid
// Math.random() in a server-rendered component. Spread across the
// full (tall) run of the beam, not just the fold.
const PARTICLES: Particle[] = Array.from({ length: 24 }, (_, i) => {
  const seed = i * 137.508;
  return {
    id: i,
    x: (seed * 3.7) % 100,
    y: (seed * 5.3) % 96,
    driftX: ((i % 5) - 2) * 8,
    duration: 8 + (i % 6),
    delay: (i % 7) * 0.6,
  };
});
