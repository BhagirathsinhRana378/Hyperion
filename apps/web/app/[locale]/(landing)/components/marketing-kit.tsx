"use client";

import { BorderBeam } from "@workspace/ui/components/landing/border-beam";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { StarBorder } from "@workspace/ui/components/marketing/StarBorder";
import { cn } from "@workspace/ui/lib/utils";
import { AlertCircle, Check, Copy, Minus, Plus } from "lucide-react";
import { motion, useScroll } from "motion/react";
import type * as React from "react";
import { useId, useRef, useState } from "react";
import { Terminal } from "./terminal";

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

/** Copy-to-clipboard icon button — flips to a check for 1.6s. */
export function CopyButton({
  className,
  value,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border/60 bg-secondary/60 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground active:scale-90",
        className
      )}
      data-slot="copy-button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      type="button"
      {...props}
    >
      {copied ? (
        <Check className="size-3.5 text-primary" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}

/** One-line command bar — `$ npx hyperion init` with a copy button. */
export function CommandBar({
  className,
  command,
  ...props
}: React.ComponentProps<"div"> & { command: string }) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-3 rounded-full border border-border bg-card/60 py-2 pr-2 pl-4 shadow-black/30 shadow-lg backdrop-blur-sm",
        className
      )}
      data-slot="command-bar"
      {...props}
    >
      <span aria-hidden={true} className="select-none text-primary/70">
        $
      </span>
      <code className="overflow-x-auto whitespace-nowrap font-mono text-foreground/90 text-sm [scrollbar-width:none]">
        {command}
      </code>
      <CopyButton value={command} />
    </div>
  );
}

/** Callout — docs note/tip/warning. Monochrome, differentiated by
 *  weight rather than hue: tips get a platinum edge, warnings a
 *  brighter left rule and title. */
export function Callout({
  className,
  variant = "note",
  title,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "note" | "tip" | "warning";
  title?: string;
}) {
  const label =
    title ??
    (variant === "tip" ? "Tip" : variant === "warning" ? "Warning" : "Note");
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 border-l-2 bg-card/50 px-4 py-3",
        variant === "warning" && "border-l-foreground/70",
        variant === "tip" && "border-l-primary/60",
        variant === "note" && "border-l-border",
        className
      )}
      data-slot="callout"
      {...props}
    >
      <p
        className={cn(
          "font-medium text-xs uppercase tracking-[0.14em]",
          variant === "warning" ? "text-foreground" : "text-foreground/70"
        )}
      >
        {label}
      </p>
      <div className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
        {children}
      </div>
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

/** Shared field-shell classes — hover glow, focus glow, validation
 *  borders. Same footprint (height/radius/padding) as before; only
 *  transitions and states are new. */
const fieldShellClasses = (invalid?: boolean, valid?: boolean) =>
  cn(
    "peer w-full rounded-lg border bg-background/60 px-4 text-foreground text-sm placeholder:text-transparent",
    "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
    "hover:border-border/80 hover:bg-background/70 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-border)_60%,transparent)]",
    "focus:border-primary/60 focus:bg-background/70 focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_16%,transparent)]",
    invalid
      ? "border-[#c98a7f]/70 focus:border-[#c98a7f]/70 focus:shadow-[0_0_0_3px_color-mix(in_oklab,#c98a7f_16%,transparent)]"
      : "border-border",
    valid && "border-[#8bbf93]/70"
  );

/** Notched floating label — sits centered inside the field like a
 *  placeholder at rest, then on focus/filled lifts to straddle the
 *  field's top border with a background patch behind it (so it reads
 *  as a cut in the border, not overlapping text), Material/Linear
 *  style. `top` is the rest-state vertical center as a CSS length
 *  (differs between the fixed-height Input and the top-anchored
 *  Textarea). */
function FloatingLabel({
  htmlFor,
  children,
  floated,
  top,
}: {
  htmlFor: string;
  children: React.ReactNode;
  floated: boolean;
  top: string;
}) {
  return (
    <label
      className={cn(
        "pointer-events-none absolute left-3.5 origin-left whitespace-nowrap font-medium transition-[transform,color,top] duration-[220ms] ease-in-out",
        floated
          ? "-translate-y-1/2 rounded bg-background px-1 text-primary/90 text-[0.8125rem]"
          : "-translate-y-1/2 text-foreground/80 text-sm peer-hover:text-foreground/90"
      )}
      htmlFor={htmlFor}
      style={{ top: floated ? 0 : top }}
    >
      {children}
    </label>
  );
}

/** Small inline validation message — fades/slides in once. */
function FieldMessage({ invalid, message }: { invalid?: boolean; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p
      className={cn(
        "landing-field-message-in flex items-center gap-1 text-xs",
        invalid ? "text-[#c98a7f]" : "text-[#8bbf93]"
      )}
    >
      {invalid ? (
        <AlertCircle className="size-3 shrink-0" />
      ) : (
        <Check className="size-3 shrink-0" />
      )}
      {message}
    </p>
  );
}

/** Dark text input — floating label, hover/focus micro-glow, optional
 *  validation state. Same height/radius/spacing as before. */
export function Input({
  className,
  label,
  id,
  invalid,
  valid,
  message,
  onFocus,
  onBlur,
  onChange,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
  invalid?: boolean;
  valid?: boolean;
  message?: string;
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    Boolean(props.defaultValue ?? props.value)
  );
  const [shake, setShake] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          className={cn(
            fieldShellClasses(invalid, valid),
            "h-11",
            shake && "landing-field-shake",
            className
          )}
          data-slot="marketing-input"
          id={fieldId}
          onAnimationEnd={() => setShake(false)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(e.currentTarget.value.length > 0);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          {...props}
        />
        {label && (
          <FloatingLabel
            floated={focused || hasValue}
            htmlFor={fieldId}
            top="50%"
          >
            {label}
          </FloatingLabel>
        )}
        {invalid && (
          <AlertCircle className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3.5 size-4 text-[#c98a7f]" />
        )}
        {valid && !invalid && (
          <Check className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3.5 size-4 text-[#8bbf93]" />
        )}
      </div>
      <FieldMessage invalid={invalid} message={message} />
    </div>
  );
}

/** Dark textarea — same treatment as Input, floating label included. */
export function Textarea({
  className,
  label,
  id,
  invalid,
  valid,
  message,
  onFocus,
  onBlur,
  onChange,
  ...props
}: React.ComponentProps<"textarea"> & {
  label?: string;
  invalid?: boolean;
  valid?: boolean;
  message?: string;
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    Boolean(props.defaultValue ?? props.value)
  );
  const [shake, setShake] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <textarea
          className={cn(
            fieldShellClasses(invalid, valid),
            "min-h-[120px] py-3",
            shake && "landing-field-shake",
            className
          )}
          data-slot="marketing-textarea"
          id={fieldId}
          onAnimationEnd={() => setShake(false)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(e.currentTarget.value.length > 0);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          {...props}
        />
        {label && (
          <FloatingLabel
            floated={focused || hasValue}
            htmlFor={fieldId}
            top="1.375rem"
          >
            {label}
          </FloatingLabel>
        )}
      </div>
      <FieldMessage invalid={invalid} message={message} />
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
 * CodeBlock — shared terminal-style window used by the coding and
 * docs pages. (The hero and features pages use the newer `Terminal`
 * component from ./terminal instead — scoped there deliberately, not
 * yet rolled out here.)
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
  return (
    <Terminal
      className={className}
      code={code}
      shell={language}
      title={header}
      typing={typing}
      {...props}
    >
      {children}
    </Terminal>
  );
}

export function StatCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <StarBorder
      className={cn(
        "h-full rounded-2xl shadow-[0_8px_30px_-14px_rgba(0,0,0,0.6)] transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-[0_0_24px_1px_rgba(124,58,237,0.08)]",
        className
      )}
      color="124, 58, 237"
      hoverOpacity={0.25}
      idleOpacity={0.06}
      speed="7s"
      thickness={1.5}
    >
      <div
        className="group/stat relative flex h-full flex-col justify-between rounded-2xl border border-white/[0.05] bg-black px-6 py-8 text-center transition-[background-color,border-color] duration-300 hover:border-primary/20 hover:bg-white/[0.02]"
        {...props}
      >
        {children}
      </div>
    </StarBorder>
  );
}
