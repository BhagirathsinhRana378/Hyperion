"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

/* ogl is client-only — split it out of the main bundle; the docs
   render instantly and the waves fade in when the chunk arrives. */
const LineWaves = dynamic(() => import("./line-waves"), { ssr: false });

/**
 * DocsBackdrop — platinum LineWaves flowing behind the docs hero:
 * slow diagonal contour lines that warp around the cursor. Kept to
 * the hero band and heavily washed so the reading surface below
 * stays perfectly quiet. Skipped entirely under
 * prefers-reduced-motion (the WebGL chunk is never even fetched).
 */
export function DocsBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden={true}
      className="absolute inset-x-0 top-0 z-0 h-[560px] overflow-hidden"
    >
      {!reduceMotion && (
        <LineWaves
          brightness={0.08}
          className="absolute inset-0"
          colorCycleSpeed={0.6}
          enableMouseInteraction={true}
          innerLineCount={32}
          mouseInfluence={1.4}
          outerLineCount={36}
          rotation={-45}
          speed={0.25}
          warpIntensity={1.0}
        />
      )}

      {/* readability wash — heavy over the title/sidebar zone (left),
          letting the waves live mostly in the upper-right */}
      <div className="absolute inset-0 [background:radial-gradient(70%_65%_at_32%_55%,color-mix(in_oklab,var(--color-background)_88%,transparent)_0%,transparent_78%)]" />

      {/* progressive settle into the reading column */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-b from-transparent via-background/60 to-background" />
    </div>
  );
}
