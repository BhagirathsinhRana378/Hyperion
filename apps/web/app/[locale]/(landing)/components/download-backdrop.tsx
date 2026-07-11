"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

/* ogl is client-only and worth splitting out of the main bundle —
   the page renders instantly, the star field fades in when its
   chunk arrives. */
const Galaxy = dynamic(() => import("./galaxy"), { ssr: false });

/**
 * DownloadBackdrop — grayscale Galaxy star field behind the download
 * hero: slow rotation, gentle twinkle, stars parting around the
 * cursor. Saturation stays at 0 so every star lives on the
 * black→platinum axis of the palette. A radial wash keeps the
 * headline area readable and the field fades out before the platform
 * cards. Skipped entirely under prefers-reduced-motion (the WebGL
 * chunk is never even fetched).
 */
export function DownloadBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden={true}
      className="absolute inset-x-0 top-0 z-0 h-[760px] overflow-hidden"
    >
      {!reduceMotion && (
        <Galaxy
          className="absolute inset-0"
          density={1.2}
          glowIntensity={0.25}
          mouseRepulsion={true}
          repulsionStrength={0.45}
          rotationSpeed={0.015}
          saturation={0}
          starSpeed={0.15}
          twinkleIntensity={0.35}
        />
      )}

      {/* readability wash behind the headline block */}
      <div className="absolute inset-0 [background:radial-gradient(55%_45%_at_50%_38%,color-mix(in_oklab,var(--color-background)_72%,transparent)_0%,transparent_75%)]" />

      {/* fade out before the platform cards */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
