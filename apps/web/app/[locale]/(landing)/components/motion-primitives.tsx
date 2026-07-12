"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* ��─ ui-craft motion tokens ──
   Duration: fast-120ms, base-200ms, medium-280ms, slow-400ms, slower-600ms
   Easing:  ease-out [0.22,1,0.36,1], emphasized [0.2,0,0,1]
   Stagger: 80-120ms marketing, 40-50ms dense UI
   Exits ~75% of entrance duration
──────────────────────────── */

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const emphasized = [0.2, 0, 0, 1] as const;

export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: easeOut },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/**
 * Counter — animates from 0 to target when scrolled into view.
 * Uses motion animate for GPU-friendly tween.
 * Respects prefers-reduced-motion: renders final value immediately.
 */
export function Counter({
  target,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    // Check reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setCount(target);
      return;
    }

    const startTime = performance.now();
    const dur = duration * 1000;

    const raf = requestAnimationFrame(function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / dur, 1);
      // Ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * Marquee — infinite horizontal scroll ticker.
 * Duplicates children for seamless loop.
 * Pauses on hover/click.
 * Respects prefers-reduced-motion: renders static.
 */
export function Marquee({
  children,
  className,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds for one full cycle */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const animDir = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div className={`overflow-hidden ${className ?? ""}`} data-slot="marquee">
      <div
        className={`flex w-max ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `${animDir} ${speed}s linear infinite`,
        }}
      >
        {children}
        {children}
      </div>
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/**
 * CornerBrackets — decorative L-shaped bracket accent around content.
 * Animates in from center-out on scroll-reveal.
 */
export function CornerBrackets({
  className,
  color = "currentColor",
  size = 16,
  strokeWidth = 2,
}: {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div className={className} data-slot="corner-brackets" ref={ref}>
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        fill="none"
        style={{ color }}
        viewBox={`0 0 ${size * 2} ${size * 2}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top-left bracket */}
        <motion.path
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          d={`M 0 ${size} L 0 0 L ${size} 0`}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transition={{ duration: 0.4, ease: easeOut }}
        />
        {/* Top-right bracket */}
        <motion.path
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          d={`M ${size * 2 - size} 0 L ${size * 2} 0 L ${size * 2} ${size}`}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.1 }}
        />
        {/* Bottom-left bracket */}
        <motion.path
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          d={`M 0 ${size * 2 - size} L 0 ${size * 2} L ${size} ${size * 2}`}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.2 }}
        />
        {/* Bottom-right bracket */}
        <motion.path
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          d={`M ${size * 2 - size} ${size * 2} L ${size * 2} ${size * 2} L ${size * 2} ${size * 2 - size}`}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.3 }}
        />
      </svg>
    </div>
  );
}

/**
 * StickyPanel — horizontal-feeling sticky section system (01/02/03/04).
 * Section sticks while sub-panels swap as user scrolls through them.
 * Each panel: number + title + description + optional visual.
 */
export function StickyPanels({
  panels,
  className,
}: {
  panels: {
    number: string;
    title: string;
    description: string;
    visual?: React.ReactNode;
  }[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, x: 0 });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    panelRefs.current.forEach((el, i) => {
      if (!el) {
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActiveIndex(i);
          }
        },
        { rootMargin: "-40% 0px -40% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Measure the active button and position the underline precisely
  useEffect(() => {
    const btn = buttonRefs.current[activeIndex];
    const nav = navRef.current;
    if (!(btn && nav)) {
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setUnderlineStyle({
      width: btnRect.width,
      x: btnRect.left - navRect.left,
    });
  }, [activeIndex]);

  return (
    <section
      className={`relative ${className ?? ""}`}
      data-slot="sticky-panels"
      ref={sectionRef}
    >
      {/* Sticky indicator — opaque + blurred so scrolling panel content
          never shows through and collides with the tab labels. Sits
          well below the floating nav (top-28) with its own clearance. */}
      <div className="sticky top-28 z-10 border-border border-b bg-background/95 shadow-black/30 shadow-lg backdrop-blur-md">
        <div
          className="relative mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={navRef}
        >
          {panels.map((p, i) => (
            <button
              className={`shrink-0 whitespace-nowrap text-body-sm-medium transition-colors duration-200 ${
                i === activeIndex
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
              key={p.number}
              onClick={() => {
                panelRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
              }}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
            >
              0{i + 1}. {p.title}
            </button>
          ))}
          {/* Underline indicator — uses transform for smooth pixel-perfect animation */}
          <div
            aria-hidden={true}
            className="absolute bottom-0 h-0.5 bg-primary transition-transform duration-300 ease-out"
            style={{
              width: underlineStyle.width,
              transform: `translateX(${underlineStyle.x}px)`,
              willChange: "transform",
            }}
          />
        </div>
      </div>

      {/* Panels */}
      <div className="mx-auto max-w-7xl px-6">
        {panels.map((panel, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              className="flex min-h-[50vh] items-center gap-8 py-12 md:py-16"
              key={panel.number}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
            >
              <div className="flex-1">
                <span
                  className={`font-display text-[5rem] leading-none transition-colors duration-500 md:text-[8rem] ${
                    isActive ? "text-primary/40" : "text-primary/15"
                  }`}
                >
                  {panel.number}
                </span>
                <h3 className="mt-2 font-display text-foreground text-heading-2">
                  {panel.title}
                </h3>
                <p className="mt-4 max-w-lg text-body-md text-muted-foreground">
                  {panel.description}
                </p>
              </div>
              <div className="hidden flex-1 md:block">
                {panel.visual ?? (
                  <div
                    className={`aspect-video rounded-xl border bg-gradient-to-br from-muted/60 via-card to-background shadow-2xl shadow-black/40 transition-all duration-500 ${
                      isActive
                        ? "scale-100 border-primary/40 opacity-100"
                        : "scale-[0.97] border-border opacity-60"
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * ProgressLine — scroll-linked progress bar that fills left-to-right
 * based on scroll position within a section.
 */
export function ProgressLine({
  className,
  trackClass,
  fillClass,
}: {
  className?: string;
  trackClass?: string;
  fillClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height + rect.top;
      const scrolled = window.innerHeight - rect.top;
      const pct = Math.min(Math.max(scrolled / total, 0), 1);
      setProgress(pct);
    };

    // Use passive listener for performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`h-1 w-full bg-border ${trackClass ?? ""} ${className ?? ""}`}
      data-slot="progress-line"
      ref={ref}
    >
      <div
        className={`h-full bg-gradient-to-r from-primary/40 to-primary transition-[width] duration-150 ${fillClass ?? ""}`}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
