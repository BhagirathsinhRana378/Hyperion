"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

/* ── ui-craft motion budget ──
   Color/opacity changes:  100-150ms
   Small UI (tooltips):     150-200ms
   Medium UI (cards, panels): 200-300ms
   Large UI (page):         300-400ms
   Exit:                    ~75% of entrance
   GPU-only:                opacity, transform
─────────────────────────── */

interface RevealProps {
  children: ReactNode;
  /** Entrance direction: up, down, left, right, scale, or none (fade only) */
  direction?: "up" | "down" | "left" | "right" | "scale" | "none";
  /** Duration in ms — default 300 (medium UI) */
  duration?: number;
  /** Delay in ms before animation starts */
  delay?: number;
  /** Offset in px for slide directions */
  offset?: number;
  /** Once triggered, do not re-trigger on scroll back */
  once?: boolean;
  className?: string;
  /** Stagger index — applies progressive delay when multiple Reveals are sequential */
  index?: number;
}

/**
 * Reveal — Scroll-triggered entrance animation.
 * Wraps any element with a fade + directional slide that activates
 * when the element scrolls into the viewport.
 *
 * Respects `prefers-reduced-motion` — renders children statically.
 * GPU-accelerated: animates only `opacity` and `transform`.
 */
export function Reveal({
  children,
  direction = "up",
  duration = 300,
  delay = 0,
  offset = 24,
  once = true,
  className,
  index = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-40px" });
  const staggerDelay = delay + index * 80;

  const getInitialTransform = () => {
    switch (direction) {
      case "up":    return { opacity: 0, y: offset };
      case "down":  return { opacity: 0, y: -offset };
      case "left":  return { opacity: 0, x: offset };
      case "right": return { opacity: 0, x: -offset };
      case "scale": return { opacity: 0, scale: 0.95 };
      case "none":  return { opacity: 0 };
    }
  };

  const durationSec = duration / 1000;
  const delaySec = staggerDelay / 1000;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialTransform()}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0, scale: 1 }
          : getInitialTransform()
      }
      transition={{
        duration: durationSec,
        delay: delaySec,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: ReactNode[];
  /** Base direction for each child entrance */
  direction?: "up" | "down" | "scale" | "none";
  /** Duration per child in ms */
  duration?: number;
  /** Stagger delay between each child in ms */
  stagger?: number;
  className?: string;
}

/**
 * StaggerReveal — Staggered entrance for a list of children.
 * Each child fades/slides in one after another.
 */
export function StaggerReveal({
  children,
  direction = "up",
  duration = 250,
  stagger = 100,
  className,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const getInitialTransform = () => {
    switch (direction) {
      case "up":    return { opacity: 0, y: 20 };
      case "down":  return { opacity: 0, y: -20 };
      case "scale": return { opacity: 0, scale: 0.95 };
      case "none":  return { opacity: 0 };
    }
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          animate={
            isInView
              ? { opacity: 1, x: 0, y: 0, scale: 1 }
              : getInitialTransform()
          }
          initial={getInitialTransform()}
          transition={{
            duration: duration / 1000,
            delay: i * (stagger / 1000),
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
