"use client";

import { cn } from "@workspace/ui/lib/utils";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import "./MagicBento.css";

/**
 * MagicBento — adapted from ReactBits (reactbits.dev, MIT).
 *
 * A grid of cards with a cursor-reactive field: a soft spotlight
 * follows the pointer across the whole section, nearby card borders
 * glow in proportion to their distance from it, and the directly
 * hovered card spawns floating particles, nudges toward the cursor
 * (magnetism), and ripples on click. Two pieces:
 *  - `MagicBentoGrid` mounts the shared cursor-tracking spotlight
 *    once per section and exposes --glow-color to every card inside.
 *  - `MagicBentoCard` is a drop-in replacement for GlowCard's shell —
 *    same className/children/props shape — that owns the per-card
 *    particle/magnetism/click layer. Callers keep their own icon,
 *    title, description, and link markup as children, unchanged.
 *
 * Hyperion adaptations from the original:
 *  - glowColor defaults to platinum (238, 238, 237) instead of
 *    purple — the monochrome palette has no hue anywhere.
 *  - the library's own asymmetric bento CSS grid (nth-child spans)
 *    is dropped; layout stays whatever Tailwind grid classes the
 *    caller already uses.
 *  - respects prefers-reduced-motion in addition to the original's
 *    mobile-breakpoint check.
 */

const DEFAULT_PARTICLE_COUNT = 6;
const DEFAULT_SPOTLIGHT_RADIUS = 220;
const DEFAULT_GLOW_COLOR = "238, 238, 237";
const MOBILE_BREAKPOINT = 768;

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function createParticleElement(x: number, y: number, glowColor: string) {
  const el = document.createElement("div");
  el.className = "magic-bento-particle";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.background = `rgba(${glowColor}, 0.7)`;
  el.style.boxShadow = `0 0 4px rgba(${glowColor}, 0.35)`;
  return el;
}

function calculateSpotlightValues(radius: number) {
  return { proximity: radius * 0.5, fadeDistance: radius * 0.75 };
}

function updateCardGlowProperties(
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
}

function useGlobalSpotlight(
  gridRef: React.RefObject<HTMLDivElement | null>,
  disableAnimations: boolean,
  enabled: boolean,
  spotlightRadius: number,
  glowColor: string
) {
  useEffect(() => {
    const section = gridRef.current;
    if (disableAnimations || !enabled || !section) {
      return;
    }

    const spotlight = document.createElement("div");
    spotlight.className = "magic-bento-global-spotlight";
    spotlight.style.width = "800px";
    spotlight.style.height = "800px";
    spotlight.style.background = `radial-gradient(circle, rgba(${glowColor}, 0.09) 0%, rgba(${glowColor}, 0.045) 15%, rgba(${glowColor}, 0.02) 25%, rgba(${glowColor}, 0.01) 40%, rgba(${glowColor}, 0.005) 65%, transparent 70%)`;
    document.body.appendChild(spotlight);

    const { proximity, fadeDistance } =
      calculateSpotlightValues(spotlightRadius);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const mouseInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      const cards = section.querySelectorAll<HTMLElement>(".magic-bento-card");

      if (!mouseInside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
        for (const card of cards) {
          card.style.setProperty("--glow-intensity", "0");
        }
        return;
      }

      let minDistance = Number.POSITIVE_INFINITY;
      for (const card of cards) {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }
        updateCardGlowProperties(
          card,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      }

      gsap.to(spotlight, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.5
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.5
            : 0;
      gsap.to(spotlight, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      for (const card of section.querySelectorAll<HTMLElement>(
        ".magic-bento-card"
      )) {
        card.style.setProperty("--glow-intensity", "0");
      }
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlight.remove();
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);
}

interface MagicBentoGridProps {
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  enableSpotlight?: boolean;
  glowColor?: string;
  spotlightRadius?: number;
}

/** Wraps a card grid with the shared cursor-tracking spotlight. */
export function MagicBentoGrid({
  children,
  className,
  enableSpotlight = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}: MagicBentoGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useMobileDetection();
  const shouldDisable = disableAnimations || isMobile || !!reduceMotion;

  useGlobalSpotlight(
    gridRef,
    shouldDisable,
    enableSpotlight,
    spotlightRadius,
    glowColor
  );

  return (
    <div
      className={cn("magic-bento-section", className)}
      ref={gridRef}
      style={{ "--glow-color": glowColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface ParticleCardOptions {
  clickEffect: boolean;
  disableAnimations: boolean;
  enableMagnetism: boolean;
  enableStars: boolean;
  enableTilt: boolean;
  glowColor: string;
  particleCount: number;
}

function useParticleCardEffects(
  ref: React.RefObject<HTMLDivElement | null>,
  opts: ParticleCardOptions
) {
  const {
    disableAnimations,
    particleCount,
    glowColor,
    enableTilt,
    clickEffect,
    enableMagnetism,
    enableStars,
  } = opts;
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const magnetismTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (disableAnimations || !el) {
      return;
    }

    const clearParticles = () => {
      for (const id of timeoutsRef.current) {
        clearTimeout(id);
      }
      timeoutsRef.current = [];
      magnetismTweenRef.current?.kill();
      for (const particle of particlesRef.current) {
        gsap.to(particle, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "back.in(1.7)",
          onComplete: () => particle.remove(),
        });
      }
      particlesRef.current = [];
    };

    const spawnParticles = () => {
      if (!enableStars) {
        return;
      }
      const { width, height } = el.getBoundingClientRect();
      for (let i = 0; i < particleCount; i++) {
        const timeoutId = setTimeout(() => {
          if (!isHoveredRef.current) {
            return;
          }
          const particle = createParticleElement(
            Math.random() * width,
            Math.random() * height,
            glowColor
          );
          el.appendChild(particle);
          particlesRef.current.push(particle);

          gsap.fromTo(
            particle,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 0.7, duration: 0.3, ease: "back.out(1.7)" }
          );
          gsap.to(particle, {
            x: (Math.random() - 0.5) * 70,
            y: (Math.random() - 0.5) * 70,
            rotation: Math.random() * 360,
            duration: 2 + Math.random() * 2,
            ease: "none",
            repeat: -1,
            yoyo: true,
          });
          gsap.to(particle, {
            opacity: 0.18,
            duration: 1.5,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
          });
        }, i * 100);
        timeoutsRef.current.push(timeoutId);
      }
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      spawnParticles();
      if (enableTilt) {
        gsap.to(el, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearParticles();
      if (enableTilt) {
        gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
      if (enableMagnetism) {
        gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!(enableTilt || enableMagnetism)) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(el, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        magnetismTweenRef.current = gsap.to(el, {
          x: (x - centerX) * 0.05,
          y: (y - centerY) * 0.05,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement("div");
      ripple.style.cssText = `position:absolute;width:${maxDistance * 2}px;height:${maxDistance * 2}px;border-radius:50%;background:radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);left:${x - maxDistance}px;top:${y - maxDistance}px;pointer-events:none;z-index:1000;`;
      el.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("click", handleClick);
      clearParticles();
    };
  }, [
    disableAnimations,
    particleCount,
    glowColor,
    enableTilt,
    clickEffect,
    enableMagnetism,
    enableStars,
    ref,
  ]);
}

interface MagicBentoCardProps extends React.ComponentProps<"div"> {
  clickEffect?: boolean;
  disableAnimations?: boolean;
  enableBorderGlow?: boolean;
  enableMagnetism?: boolean;
  enableStars?: boolean;
  enableTilt?: boolean;
  glowColor?: string;
  particleCount?: number;
}

/** Drop-in replacement for GlowCard's shell — same recipe, plus
 *  particles, grid-wide proximity border-glow, magnetism, and a
 *  click ripple. Must live inside a `MagicBentoGrid`. */
export function MagicBentoCard({
  className,
  children,
  enableStars = true,
  enableBorderGlow = true,
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = false,
  clickEffect = true,
  enableMagnetism = true,
  ...props
}: MagicBentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useMobileDetection();
  const shouldDisable = disableAnimations || isMobile || !!reduceMotion;

  useParticleCardEffects(cardRef, {
    disableAnimations: shouldDisable,
    particleCount,
    glowColor,
    enableTilt,
    clickEffect,
    enableMagnetism,
    enableStars,
  });

  return (
    <div
      className={cn(
        "group/card magic-bento-card relative overflow-hidden rounded-2xl border border-border bg-card/40 transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:border-primary/40 hover:shadow-black/40 hover:shadow-xl",
        enableBorderGlow && "magic-bento-card--border-glow",
        className
      )}
      data-slot="magic-bento-card"
      ref={cardRef}
      {...props}
    >
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}
