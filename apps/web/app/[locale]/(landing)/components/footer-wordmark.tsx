"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

/**
 * FooterWordmark — a hidden signature, not a logo.
 *
 * At rest it's a near-invisible watermark: no glow, no blur, no
 * cursor tracking, no looping animation. On hover, a small
 * soft-edged spotlight follows the cursor and brings only the
 * letterforms directly beneath it into full view — the rest of the
 * word stays faint, so the wordmark feels discovered rather than
 * switched on. Touch devices (no hover) get a slightly higher
 * resting opacity instead, since there's no pointer to reveal with.
 */
export function FooterWordmark({ text = "HYPERION" }: { text?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [pos, setPos] = useState({ cx: "50%", cy: "50%" });
  const reduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden={true}
      className="block w-full select-none"
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onMouseMove={(e) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({
          cx: `${((e.clientX - rect.left) / rect.width) * 100}%`,
          cy: `${((e.clientY - rect.top) / rect.height) * 100}%`,
        });
      }}
      ref={svgRef}
      viewBox="0 0 900 130"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft circular spotlight — feathered via gradient stops, no filter blur. */}
        <motion.radialGradient
          animate={pos}
          gradientUnits="userSpaceOnUse"
          id="wordmark-spotlight"
          initial={{ cx: "50%", cy: "50%" }}
          r="90"
          transition={{
            duration: reduceMotion ? 0 : 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="45%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="wordmark-spotlight-mask">
          <rect fill="url(#wordmark-spotlight)" height="100%" width="100%" />
        </mask>
      </defs>

      {/* Watermark — always present at rest opacity, never animated. */}
      <text
        className="wordmark-base fill-transparent stroke-foreground"
        dominantBaseline="middle"
        lengthAdjust="spacingAndGlyphs"
        strokeWidth="1"
        style={{ fontFamily: "var(--font-wordmark)", fontSize: 104 }}
        textAnchor="middle"
        textLength={870}
        x="50%"
        y="56%"
      >
        {text}
      </text>

      {/* Spotlight reveal — full strength only inside the cursor-following mask. */}
      <text
        className="fill-transparent stroke-foreground opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none"
        dominantBaseline="middle"
        lengthAdjust="spacingAndGlyphs"
        mask="url(#wordmark-spotlight-mask)"
        strokeWidth="1.25"
        style={{
          fontFamily: "var(--font-wordmark)",
          fontSize: 104,
          opacity: revealed ? 1 : 0,
        }}
        textAnchor="middle"
        textLength={870}
        x="50%"
        y="56%"
      >
        {text}
      </text>
    </svg>
  );
}
