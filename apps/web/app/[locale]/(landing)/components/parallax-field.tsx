"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

/**
 * ParallaxField — a full-page 3D background with two motion systems
 * layered together:
 *
 *  1. Scroll parallax — three depth layers counter-translate at
 *     different fractions of the scroll position (far moves slowest),
 *     driven by MotionValues so no React re-render ever fires.
 *  2. Pointer parallax — the same layers drift a few px toward the
 *     cursor (near drifts furthest), via CSS custom properties set
 *     imperatively from a rAF-throttled pointermove listener, eased
 *     by a CSS transition for a smooth laggy follow.
 *
 * The scene itself: a perspective wireframe grid floor flowing toward
 * the viewer under an amber horizon glow, plus 3D-rotated rings,
 * planes, and soft orbs floating at each depth. Everything is
 * transform/opacity-only and pointer-events-none; the whole field
 * disables its motion under prefers-reduced-motion.
 */

/** Depth wrapper — cursor-follow drift, scaled by px per layer. */
function MouseLayer({ px, children }: { px: number; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform"
      style={{
        transform: `translate3d(calc(var(--par-x, 0) * ${px}px), calc(var(--par-y, 0) * ${px * 0.6}px), 0)`,
      }}
    >
      {children}
    </div>
  );
}

export function ParallaxField() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Farther layers counteract more of the scroll → appear to sit deeper.
  const yFar = useTransform(scrollY, (v) => (reduceMotion ? 0 : v * 0.42));
  const yMid = useTransform(scrollY, (v) => (reduceMotion ? 0 : v * 0.24));
  const yNear = useTransform(scrollY, (v) => (reduceMotion ? 0 : v * 0.1));

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const el = rootRef.current;
    if (!el) {
      return;
    }
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(() => {
        raf = 0;
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        el.style.setProperty("--par-x", nx.toFixed(3));
        el.style.setProperty("--par-y", ny.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden={true}
      className="-z-10 pointer-events-none absolute inset-0 overflow-hidden"
      ref={rootRef}
    >
      {/* ── 3D grid floor — recedes to a horizon at the top of the page ── */}
      <div className="absolute inset-x-0 top-0 h-[640px] opacity-45 [mask-image:radial-gradient(ellipse_75%_70%_at_50%_0%,#000_30%,transparent_80%)] [perspective:1000px]">
        <div className="[transform:rotateX(64deg)] absolute inset-x-[-35%] top-[-2%] h-[150%] origin-top">
          <div
            className="landing-grid-flow absolute inset-x-0 top-0 h-[200%] will-change-transform"
            style={{
              background:
                "repeating-linear-gradient(to right, color-mix(in oklab, var(--color-border) 80%, transparent) 0 1px, transparent 1px 64px), repeating-linear-gradient(to bottom, color-mix(in oklab, var(--color-border) 80%, transparent) 0 1px, transparent 1px 64px)",
            }}
          />
        </div>
      </div>
      {/* Horizon glow the grid vanishes into */}
      <div className="landing-glow-breathe absolute inset-x-0 top-0 h-[380px] [background:radial-gradient(55%_65%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent)_0%,transparent_70%)]" />

      {/* ── FAR layer — dim, small, slowest ── */}
      <motion.div className="absolute inset-0" style={{ y: yFar }}>
        <MouseLayer px={6}>
          {/* Big tilted ellipse ring behind the horizon */}
          <div className="[transform:rotate3d(1,0,0,74deg)] absolute top-[-90px] right-[-140px] size-[460px] rounded-full border border-border/40" />
          {/* Distant soft orb */}
          <div className="absolute top-[120px] left-[-80px] size-64 rounded-full bg-primary/[0.06] blur-3xl" />
          {/* Scattered far dots */}
          <span className="absolute top-[210px] left-[22%] size-1 rounded-full bg-foreground/25" />
          <span className="absolute top-[340px] left-[64%] size-1 rounded-full bg-foreground/20" />
          <span className="absolute top-[520px] left-[38%] size-1 rounded-full bg-foreground/15" />
          <span className="absolute top-[760px] left-[80%] size-1 rounded-full bg-foreground/20" />
          <span className="absolute bottom-[420px] left-[14%] size-1 rounded-full bg-foreground/20" />
        </MouseLayer>
      </motion.div>

      {/* ── MID layer ── */}
      <motion.div className="absolute inset-0" style={{ y: yMid }}>
        <MouseLayer px={14}>
          {/* Tilted wireframe plane, drifting */}
          <div
            className="landing-float [transform:rotate3d(0.8,1,0,48deg)] absolute top-[330px] left-[5%] size-40 rounded-2xl border border-border/70"
            style={{ "--float-dur": "9s" } as CSSProperties}
          />
          {/* Amber-tinged 3D ring */}
          <div
            className="landing-float [transform:rotate3d(1,0.4,0,66deg)] absolute top-[170px] right-[7%] size-56 rounded-full border border-primary/20 shadow-[0_0_60px_-20px] shadow-primary/30"
            style={{ "--float-dur": "11s", "--float-delay": "-4s" } as CSSProperties}
          />
          {/* Lower plane near the FAQ zone */}
          <div
            className="landing-float [transform:rotate3d(1,0.9,0.2,55deg)] absolute bottom-[480px] left-[3%] size-28 rounded-xl border border-border/60"
            style={{ "--float-dur": "10s", "--float-delay": "-6s" } as CSSProperties}
          />
        </MouseLayer>
      </motion.div>

      {/* ── NEAR layer — brightest, fastest ── */}
      <motion.div className="absolute inset-0" style={{ y: yNear }}>
        <MouseLayer px={26}>
          {/* Glowing near orb */}
          <div className="absolute top-[500px] left-[10%] size-40 rounded-full bg-primary/10 blur-2xl" />
          {/* Bright 3D ring */}
          <div
            className="landing-float [transform:rotate3d(1,0.2,0.1,62deg)] absolute top-[600px] right-[12%] size-32 rounded-full border border-primary/30 shadow-[0_0_40px_-12px] shadow-primary/40"
            style={{ "--float-dur": "7s" } as CSSProperties}
          />
          {/* Floating diamond plane near the bottom */}
          <div
            className="landing-float [transform:rotate3d(0.4,1,0.3,58deg)_rotate(45deg)] absolute right-[28%] bottom-[300px] size-16 rounded-lg border border-border/80"
            style={{ "--float-dur": "8s", "--float-delay": "-3s" } as CSSProperties}
          />
          {/* Near accent dots */}
          <span className="absolute top-[420px] left-[46%] size-1.5 rounded-full bg-primary/50 shadow-[0_0_8px_2px] shadow-primary/30" />
          <span className="absolute right-[8%] bottom-[560px] size-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_2px] shadow-primary/25" />
        </MouseLayer>
      </motion.div>
    </div>
  );
}
