"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useWebglSupported } from "./use-webgl-supported";

/* ogl is client-only — split it out of the main bundle; the page
   renders instantly and the rays fade in when the chunk arrives. */
const LightRays = dynamic(() => import("./light-rays"), { ssr: false });

/**
 * ContactBackdrop — monochrome LightRays fan behind the "get access"
 * hero, kept subtle (modest spread/fade, mouse-follow off) so it
 * reads as ambient texture behind the headline rather than a focal
 * effect. A readability wash keeps the form legible and the field
 * fades out before the form/sidebar grid. Skipped entirely under
 * prefers-reduced-motion (the WebGL chunk is never even fetched).
 */
export function ContactBackdrop() {
  const reduceMotion = useReducedMotion();
  const webglSupported = useWebglSupported();
  const showLive = !reduceMotion && webglSupported;

  return (
    <div
      aria-hidden={true}
      className="absolute inset-x-0 top-0 z-0 h-[480px] overflow-hidden"
    >
      {showLive ? (
        <LightRays
          className="absolute inset-0"
          fadeDistance={0.9}
          followMouse={false}
          lightSpread={0.9}
          noiseAmount={0.05}
          rayLength={1.4}
          raysColor="#EEEEED"
          raysOrigin="top-center"
          raysSpeed={0.7}
          saturation={0}
        />
      ) : (
        // Static fallback — a top-center platinum wash echoing the rays'
        // origin, for reduced-motion / no-WebGL machines.
        <div className="absolute inset-0 [background:radial-gradient(50%_65%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent)_0%,transparent_72%)]" />
      )}

      {/* readability wash behind the headline block */}
      <div className="absolute inset-0 [background:radial-gradient(60%_55%_at_50%_25%,color-mix(in_oklab,var(--color-background)_78%,transparent)_0%,transparent_75%)]" />

      {/* fade out before the form/sidebar grid */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
