"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Github, Globe, Linkedin, Twitter, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { revealVariants, staggerContainer } from "./motion-primitives";

export interface Dev {
  bio: string;
  contribution: string;
  github?: string;
  initials: string;
  linkedin?: string;
  name: string;
  /** Real avatar, when available — falls back to the initials disc. */
  photoUrl?: string;
  portfolio?: string;
  role: string;
  skills: string[];
  twitter?: string;
}

/** Shared avatar — photo when provided, initials disc otherwise. */
function DevAvatar({
  className,
  dev,
  size = "size-20",
}: {
  className?: string;
  dev: Dev;
  size?: string;
}) {
  if (dev.photoUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: avatar source is per-dev user content, not a static build asset next/image would optimize
      <img
        alt={dev.name}
        className={cn(size, "rounded-full object-cover", className)}
        src={dev.photoUrl}
      />
    );
  }
  return (
    <div
      className={cn(
        size,
        "flex items-center justify-center rounded-full border border-border bg-secondary font-display text-2xl text-muted-foreground",
        className
      )}
    >
      {dev.initials}
    </div>
  );
}

/**
 * DevCard — an "invisible hotspot," not a card. At rest it shows
 * nothing but a barely-there watermark of the dev's initials, and
 * sits BELOW DevsBackdrop's beam in z-index (see devs/page.tsx) so it
 * reads as hidden beneath the light. On hover/focus it rises above
 * the beam (z-index only, no portal needed — the grid it lives in
 * deliberately carries no z-index of its own, so this can out-rank a
 * z-indexed sibling) and its identity dissolves into view: glass
 * overlay, avatar, name, role, one-line bio, all in one slow fade +
 * lift. Click still opens the full DevModal.
 */
function DevCard({
  dev,
  onHoverChange,
  onOpen,
}: {
  dev: Dev;
  onHoverChange: (hovering: boolean) => void;
  onOpen: () => void;
}) {
  return (
    <motion.button
      aria-label={`${dev.name}, ${dev.role} — view details`}
      className="group/devcard relative z-0 flex h-64 w-full flex-col items-center justify-center overflow-hidden text-center hover:z-30 focus-visible:z-30 focus-visible:outline-none sm:h-80"
      onBlur={() => onHoverChange(false)}
      onClick={onOpen}
      onFocus={() => onHoverChange(true)}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      type="button"
      variants={revealVariants}
    >
      {/* idle silhouette — the only thing visible before interaction */}
      <span
        aria-hidden={true}
        className="pointer-events-none absolute select-none font-display text-7xl text-foreground/[0.04] transition-opacity duration-500 ease-out group-hover/devcard:opacity-0 group-focus-visible/devcard:opacity-0 sm:text-8xl"
      >
        {dev.initials}
      </span>

      {/* glass overlay — only exists once hovered/focused */}
      <span
        aria-hidden={true}
        className="pointer-events-none absolute inset-3 rounded-3xl bg-white/[0.025] opacity-0 shadow-[inset_0_1px_0_0] shadow-white/10 backdrop-blur-md transition-opacity duration-500 ease-out group-hover/devcard:opacity-100 group-focus-visible/devcard:opacity-100"
      />

      {/* revealed identity — fade, lift, and un-blur together */}
      <div className="relative flex translate-y-3 flex-col items-center px-6 opacity-0 blur-[3px] transition-all duration-500 ease-out group-hover/devcard:translate-y-0 group-hover/devcard:opacity-100 group-hover/devcard:blur-none group-focus-visible/devcard:translate-y-0 group-focus-visible/devcard:opacity-100 group-focus-visible/devcard:blur-none">
        <DevAvatar
          className="border-primary/30"
          dev={dev}
          size="size-14 sm:size-16"
        />
        <p className="mt-4 font-medium text-foreground text-sm">{dev.name}</p>
        <p className="mt-1 text-muted-foreground text-xs">{dev.role}</p>
        <p className="mt-3 hidden max-w-[15rem] text-[0.7rem] text-muted-foreground/70 leading-relaxed sm:block">
          {dev.bio}
        </p>
      </div>
    </motion.button>
  );
}

const socialLinks: {
  href: (dev: Dev) => string | undefined;
  icon: typeof Github;
  label: string;
}[] = [
  { icon: Github, label: "GitHub", href: (d) => d.github },
  { icon: Linkedin, label: "LinkedIn", href: (d) => d.linkedin },
  { icon: Twitter, label: "Twitter", href: (d) => d.twitter },
  { icon: Globe, label: "Portfolio", href: (d) => d.portfolio },
];

/**
 * DevModal — glassmorphism detail panel. Built without a dialog
 * primitive (this app doesn't depend on radix-ui directly, only
 * packages/ui does) so escape/overlay-click/focus-restore/scroll-lock
 * are hand-rolled here, all straightforward for a single modal.
 */
function DevModal({ dev, onClose }: { dev: Dev | null; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!dev) {
      return;
    }

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [dev, onClose]);

  return (
    <AnimatePresence>
      {dev && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-6 backdrop-blur-lg"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-labelledby="dev-modal-title"
            aria-modal={true}
            className={cn(
              "relative w-full max-w-sm rounded-[28px] border border-white/10 bg-card/50 p-8 text-center shadow-[0_0_80px_-15px] shadow-primary/20 backdrop-blur-xl",
              "shadow-[inset_0_1px_0_0] shadow-white/10 supports-backdrop-filter:bg-card/30"
            )}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <button
              aria-label="Close"
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              <X className="size-4" />
            </button>

            <DevAvatar className="mx-auto border-primary/40" dev={dev} />
            <h2
              className="mt-5 font-display text-foreground text-xl"
              id="dev-modal-title"
            >
              {dev.name}
            </h2>
            <p className="mt-1 text-primary/80 text-sm">{dev.role}</p>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              {dev.bio}
            </p>

            {dev.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                {dev.skills.map((skill) => (
                  <span
                    className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-muted-foreground text-xs"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-xl border border-border/60 bg-background/40 p-4 text-left">
              <p className="font-medium text-foreground text-xs uppercase tracking-[0.15em]">
                Contribution to Hyperion
              </p>
              <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                {dev.contribution}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => {
                const url = href(dev);
                if (!url) {
                  return null;
                }
                return (
                  <a
                    aria-label={`${dev.name} on ${label}`}
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-[color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                    href={url}
                    key={label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DevGrid({
  devs,
  onHoverChange,
}: {
  devs: Dev[];
  onHoverChange?: (hovering: boolean) => void;
}) {
  const [activeDev, setActiveDev] = useState<Dev | null>(null);
  const hoveredRef = useRef<Set<string>>(new Set());

  const updateHover = (name: string, hovering: boolean) => {
    const set = hoveredRef.current;
    if (hovering) {
      set.add(name);
    } else {
      set.delete(name);
    }
    onHoverChange?.(set.size > 0);
  };

  return (
    <>
      {/* No wrapping box, no border, no background — deliberately no
          z-index here either, so an individual hovered DevCard's
          higher z-index competes directly against DevsBackdrop's beam
          layer instead of being capped inside this grid's own stacking
          context. */}
      <motion.div
        animate="visible"
        className="relative grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-white/[0.04]"
        initial="hidden"
        variants={staggerContainer}
      >
        {devs.map((dev) => (
          <DevCard
            dev={dev}
            key={dev.name}
            onHoverChange={(hovering) => {
              updateHover(dev.name, hovering);
            }}
            onOpen={() => setActiveDev(dev)}
          />
        ))}
      </motion.div>

      <DevModal dev={activeDev} onClose={() => setActiveDev(null)} />
    </>
  );
}
