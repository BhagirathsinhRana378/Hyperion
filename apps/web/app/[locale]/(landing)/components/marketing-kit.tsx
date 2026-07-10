"use client";

import { BorderBeam } from "@workspace/ui/components/landing/border-beam";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { cn } from "@workspace/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import TextType from "./text-type";

/* ─────────────────────────────────────────────────────────────
   Local dark marketing kit for the (landing) route group.
   Palette follows the 60/30/10 rule with semantic tokens only:
   60% background · 30% card/muted surfaces · 10% primary accent.
──────────────────────────────────────────────────────────── */

/** Pill badge — outline is the default; solid reserved for emphasis. */
export function Badge({
  className,
  variant = "outline",
  ...props
}: React.ComponentProps<"span"> & { variant?: "outline" | "solid" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs",
        variant === "solid"
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-secondary text-foreground/70",
        className
      )}
      data-slot="badge"
      {...props}
    />
  );
}

/**
 * GlowCard — raised dark surface with a sleek hover treatment:
 * lifts slightly, border warms toward the accent, and a soft
 * radial accent glow follows the cursor.
 */
export function GlowCard({
  className,
  children,
  beam = false,
  tilt = true,
  ...props
}: React.ComponentProps<"div"> & {
  /** Adds a slow orbiting light along the card border — reserve for one flagship card per page. */
  beam?: boolean;
  /** Subtle mouse-driven 3D tilt + lift. Disable for forms/interactive content. */
  tilt?: boolean;
}) {
  // Cursor position and tilt are mutated directly on the DOM (CSS custom
  // properties + inline transform) instead of via React state, so a
  // mousemove never triggers a re-render — only transform/opacity change,
  // which the browser can composite on the GPU without layout or paint.
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "group/card relative overflow-hidden rounded-2xl border border-border bg-card/40 transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:border-primary/40 hover:shadow-black/40 hover:shadow-xl",
        className
      )}
      data-slot="glow-card"
      onMouseEnter={() => {
        if (tilt && cardRef.current) {
          cardRef.current.style.transform =
            "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(-4px)";
        }
      }}
      onMouseLeave={() => {
        if (cardRef.current) {
          cardRef.current.style.transform = "";
        }
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glowRef.current?.style.setProperty("--mx", `${x}px`);
        glowRef.current?.style.setProperty("--my", `${y}px`);
        if (tilt && cardRef.current) {
          const px = x / rect.width - 0.5;
          const py = y / rect.height - 0.5;
          cardRef.current.style.transform = `perspective(900px) rotateX(${py * -5}deg) rotateY(${px * 5}deg) translateY(-4px)`;
        }
      }}
      ref={cardRef}
      {...props}
    >
      <div
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        ref={glowRef}
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--color-primary) 8%, transparent), transparent 70%)",
        }}
      />
      {beam && (
        <BorderBeam
          className="from-transparent via-primary to-transparent"
          duration={8}
          size={140}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/** Section eyebrow — small uppercase label with a leading tick line. */
export function Eyebrow({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-medium text-primary text-xs uppercase tracking-[0.2em]",
        className
      )}
      data-slot="eyebrow"
      {...props}
    >
      <span aria-hidden={true} className="h-px w-6 bg-primary/60" />
      {children}
    </span>
  );
}

/**
 * Primary pill CTA link — magnetic: it eases a few pixels toward the
 * cursor while hovered and springs back on leave.
 */
export function CtaLink({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<"a"> & { variant?: "primary" | "ghost" }) {
  // Imperative ref mutation instead of React state — a mousemove only
  // ever touches `transform` directly on the node, never re-renders.
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    // biome-ignore lint/a11y/useValidAnchor: consumers pass href
    <a
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 font-medium text-sm transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out active:scale-[0.98]",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/85 hover:shadow-[0_0_24px_-4px] hover:shadow-primary/40"
          : "border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-muted/50",
        className
      )}
      data-slot="cta-link"
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.style.transform = "";
        }
      }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!(rect && ref.current)) {
          return;
        }
        const x = (e.clientX - (rect.left + rect.width / 2)) * 0.12;
        const y = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }}
      ref={ref}
      {...props}
    />
  );
}

/** Hairline scroll-progress bar pinned above the nav. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden={true}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary/70"
      data-slot="scroll-progress"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/** Dark text input with accent focus ring. */
export function Input({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<"input"> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="font-medium text-foreground/80 text-sm" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-background/60 px-4 text-foreground text-sm placeholder:text-muted-foreground",
          "transition-colors duration-150 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
          className
        )}
        data-slot="marketing-input"
        id={id}
        {...props}
      />
    </div>
  );
}

/** Dark textarea with accent focus ring. */
export function Textarea({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<"textarea"> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="font-medium text-foreground/80 text-sm" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "min-h-[120px] w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground",
          "transition-colors duration-150 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
          className
        )}
        data-slot="marketing-textarea"
        id={id}
        {...props}
      />
    </div>
  );
}

/** Accordion FAQ — smooth grid-rows height animation, accent icon. */
export function FAQ({
  className,
  items,
  ...props
}: React.ComponentProps<"div"> & {
  items: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("space-y-3", className)} data-slot="faq" {...props}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <Reveal
            direction="up"
            duration={200}
            index={index}
            key={item.question}
          >
            <div
              className={cn(
                "overflow-hidden rounded-xl border bg-card/40 transition-colors duration-200",
                isOpen ? "border-primary/40" : "border-border"
              )}
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-foreground text-sm transition-colors duration-150 hover:bg-muted/40"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                type="button"
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <Minus className="size-4 shrink-0 text-primary" />
                ) : (
                  <Plus className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/**
 * CodeBlock — the site's one shared terminal window.
 *
 * Fixed-size viewport, like a real terminal app (Warp/iTerm/VS Code):
 * 360px tall on mobile, 440px on tablet, 500px on desktop, up to
 * 1000px wide — the window NEVER grows with its content. Output fills
 * the inside; anything past the viewport scrolls internally
 * (overflow-y), and while `typing` plays the view stays pinned to the
 * latest line, so the surrounding layout never shifts.
 *
 * Typing is driven by TextType (single pass, starts when scrolled
 * into view) trailing the same blinking block cursor. Respects
 * prefers-reduced-motion by rendering the full text statically.
 */
export function CodeBlock({
  className,
  header,
  language = "shell",
  code,
  typing = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  header?: string;
  language?: string;
  code?: string;
  typing?: boolean;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const showTyping = typing && !reduceMotion && !!code;

  // Auto-scroll: while output is being typed, keep the viewport pinned
  // to the newest line. A MutationObserver keeps this decoupled from
  // the typing engine — any DOM growth inside the body re-pins.
  useEffect(() => {
    const el = bodyRef.current;
    if (!(el && showTyping)) {
      return;
    }
    const observer = new MutationObserver(() => {
      el.scrollTop = el.scrollHeight;
    });
    observer.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [showTyping]);

  return (
    <Reveal direction="up" duration={350} offset={32}>
      <div
        className={cn(
          "mx-auto flex h-[360px] w-full max-w-[1000px] flex-col overflow-hidden rounded-xl border border-border bg-black/50 shadow-2xl shadow-black/40 backdrop-blur-sm md:h-[440px] lg:h-[500px]",
          className
        )}
        data-slot="code-block"
        {...props}
      >
        <div className="flex shrink-0 items-center gap-2 border-border border-b bg-muted/30 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          {header && (
            <span className="ml-2 font-mono text-muted-foreground text-xs">
              {header}
            </span>
          )}
          <span className="ml-auto font-mono text-muted-foreground text-xs">
            {language}
          </span>
        </div>
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 [overscroll-behavior:contain] [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]"
          ref={bodyRef}
        >
          {children ?? (
            <pre className="whitespace-pre-wrap break-words font-mono text-foreground/85 text-sm leading-relaxed">
              {showTyping && code ? (
                <TextType
                  as="span"
                  cursorCharacter={
                    <span
                      aria-hidden={true}
                      className="inline-block h-4 w-2 translate-y-0.5 bg-primary/80"
                    />
                  }
                  cursorClassName="ml-0.5"
                  loop={false}
                  showCursor={true}
                  startOnVisible={true}
                  text={code}
                  typingSpeed={8}
                />
              ) : (
                <code>{code}</code>
              )}
            </pre>
          )}
        </div>
      </div>
    </Reveal>
  );
}
