"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

/* three is client-only — split it out of the main bundle; the page
   renders instantly and the beam fades in when the chunk arrives. */
const LaserFlow = dynamic(() => import("./laser-flow"), { ssr: false });

/**
 * DevsBackdrop — monochrome LaserFlow beam behind the "we are 4
 * developers" hero, kept subtle (modest fog/wisp intensity) so it
 * reads as ambient texture rather than a focal effect. Skipped
 * entirely under prefers-reduced-motion (the WebGL chunk is never
 * even fetched).
 */
export function DevsBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden={true}
      className="absolute inset-x-0 top-0 z-0 h-[620px] overflow-hidden"
    >
      {!reduceMotion && (
        <LaserFlow
          className="absolute inset-0"
          color="#EEEEED"
          fogIntensity={0.35}
          horizontalBeamOffset={0.0}
          verticalBeamOffset={-0.1}
          wispIntensity={3.5}
        />
      )}

      {/* readability wash behind the headline block */}
      <div className="absolute inset-0 [background:radial-gradient(55%_50%_at_50%_28%,color-mix(in_oklab,var(--color-background)_75%,transparent)_0%,transparent_75%)]" />

      {/* fade out before the dev cards */}
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
