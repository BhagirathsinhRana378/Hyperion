"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

/* three.js + postprocessing are heavy — split them out of the main
   bundle and only load on the client, after hydration. The hero
   renders instantly with the static overlays; the grid fades in
   underneath them when its chunk arrives. */
const GridScan = dynamic(() => import("./grid-scan"), { ssr: false });

/**
 * HeroBackdrop — the hero's full layer stack, bottom to top:
 *   1. GridScan (WebGL holographic grid + platinum scan beam)
 *   2. dark gradient wash (top → bottom readability)
 *   3. radial spotlight behind the headline for contrast
 *   4. edge vignette
 *   5. bottom fade into the next section
 * All overlays are pure CSS gradients in palette tokens; content sits
 * above this entire stack via z-index. Under prefers-reduced-motion
 * the WebGL layer is skipped entirely — the overlays alone keep the
 * hero's depth without any motion (and without paying for three.js).
 */
export function HeroBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden={true} className="absolute inset-0 z-0 overflow-hidden">
      {/* 1 — living holographic surface. Pingpong sweep + click-to-scan
          (clicking anywhere in the hero fires an extra beam); the
          cursor skews, rolls, and yaws the plane toward the pointer. */}
      {!reduceMotion && (
        <GridScan
          className="absolute inset-0"
          lineJitter={0.05}
          scanDirection="pingpong"
          scanOnClick={true}
          sensitivity={0.01}
        />
      )}

      {/* 2 — dark wash so mid-screen lines never fight the copy */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/25 to-transparent" />

      {/* 3 — radial spotlight: darkens directly behind the headline block */}
      <div className="absolute inset-0 [background:radial-gradient(58%_48%_at_50%_40%,color-mix(in_oklab,var(--color-background)_78%,transparent)_0%,transparent_72%)]" />

      {/* 4 — vignette around the edges */}
      <div className="absolute inset-0 [background:radial-gradient(120%_95%_at_50%_50%,transparent_55%,color-mix(in_oklab,var(--color-background)_92%,transparent)_100%)]" />

      {/* 5 — fade into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
