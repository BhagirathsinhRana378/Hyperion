"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

/* ogl is client-only — split it out of the main bundle; the page
   renders instantly and the light streaks fade in when the chunk
   arrives. */
const Lightfall = dynamic(() => import("./lightfall"), { ssr: false });

/**
 * FeaturesBackdrop — monochrome Lightfall streaks behind the features
 * hero: a slow, quiet tunnel of falling platinum light rather than
 * the stock demo's blue/violet/pink, kept subtle (low opacity, modest
 * streak count) so it reads as ambient texture, not a focal effect.
 * A radial wash keeps the headline readable and the field fades out
 * before the pillar cards. Skipped entirely under
 * prefers-reduced-motion (the WebGL chunk is never even fetched).
 */
export function FeaturesBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden={true}
      className="absolute inset-x-0 top-0 z-0 h-[620px] overflow-hidden"
    >
      {!reduceMotion && (
        <Lightfall
          backgroundGlow={0.35}
          className="absolute inset-0"
          density={0.45}
          glow={0.85}
          mouseRadius={0.8}
          mouseStrength={0.4}
          opacity={0.55}
          speed={0.4}
          streakCount={5}
          streakLength={1.3}
          streakWidth={0.8}
          twinkle={0.6}
          zoom={3.4}
        />
      )}

      {/* readability wash behind the headline block */}
      <div className="absolute inset-0 [background:radial-gradient(55%_50%_at_50%_32%,color-mix(in_oklab,var(--color-background)_78%,transparent)_0%,transparent_75%)]" />

      {/* fade out before the pillar cards */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
