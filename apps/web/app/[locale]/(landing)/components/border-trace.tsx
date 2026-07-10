"use client";

import { motion, useReducedMotion } from "motion/react";

interface BorderTraceProps {
  /** Must match the parent's border-radius in px so the traced path aligns exactly. */
  radius?: number;
  /** Diameter of the traveling glow in px — keep small relative to the container. */
  beamSize?: number;
  /** Seconds for one full loop around the perimeter. */
  duration?: number;
  className?: string;
}

/** The "Hyperion Aura" spectrum — amber → magenta → violet → cyan → back
 * to amber. Reserved exclusively for this component: the site's one
 * signature multi-hue flourish. Everywhere else uses the flat --primary
 * amber, so this stays a rare, deliberate moment rather than a theme. */
const AURA_SPECTRUM =
  "conic-gradient(from 0deg, #ff7a29, #e94bd1, #8b5cf6, #22d3ee, #ff7a29)";

/**
 * BorderTrace — a small soft aura that travels the complete rounded
 * perimeter of its parent in one continuous, seamless loop, gently
 * cycling through the Hyperion Aura spectrum as it goes (the CSS
 * motion-path auto-rotates the traveling element to match the path's
 * tangent, so a fixed conic gradient reads as a shifting hue as it
 * rounds the corners — no extra keyframes needed). Pure CSS motion-path
 * (offset-path: rect(... round Rpx)) plus a dual-mask ring trick, so it
 * works at any size/radius with no SVG and no visible start/end seam —
 * GPU-composited (opacity/transform only, no filter blur). Pair with a
 * real 1px border on the parent for the always-visible hairline
 * underneath; this only adds the moving highlight on top of it.
 */
export function BorderTrace({
  radius = 32,
  beamSize = 110,
  duration = 8,
  className,
}: BorderTraceProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return null;
  }

  return (
    <div
      aria-hidden={true}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className ?? ""}`}
      style={{ borderWidth: 1 }}
    >
      <motion.div
        animate={{ offsetDistance: "100%" }}
        className="absolute aspect-square"
        initial={{ offsetDistance: "0%" }}
        style={{
          width: beamSize,
          offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          background: AURA_SPECTRUM,
          maskImage: "radial-gradient(circle, black 25%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(circle, black 25%, transparent 68%)",
        }}
        transition={{ duration, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  );
}
