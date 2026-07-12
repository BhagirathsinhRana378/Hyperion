"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { Github, Linkedin, Twitter } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { revealVariants, staggerContainer } from "./motion-primitives";

export interface Dev {
  bio: string;
  github?: string;
  initials: string;
  linkedin?: string;
  name: string;
  role: string;
  twitter?: string;
}

/**
 * DevCard — sits dim/hidden by default and only reveals its identity
 * on hover (per spec: "hovered devs cards can be seen"), then opens a
 * glassmorphism detail modal on click. The card shell itself is
 * always visible (border/shape), only the name/role/avatar content
 * fades in on hover so the grid doesn't read as empty placeholders.
 */
function DevCard({ dev, onOpen }: { dev: Dev; onOpen: () => void }) {
  return (
    <motion.button
      aria-label={`${dev.name}, ${dev.role} — view details`}
      className="group/devcard relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card/40 text-center transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-black/40 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:border-primary/40 focus-visible:shadow-black/40 focus-visible:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      onClick={onOpen}
      type="button"
      variants={revealVariants}
    >
      {/* cursor-follow glow, same treatment as GlowCard */}
      <div
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 opacity-0 [background:radial-gradient(220px_circle_at_50%_40%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_70%)] transition-opacity duration-300 group-focus-visible/devcard:opacity-100 group-hover/devcard:opacity-100"
      />

      <div className="relative flex size-20 items-center justify-center rounded-full border border-border bg-secondary font-display text-2xl text-muted-foreground transition-[color,border-color,transform] duration-300 ease-out group-focus-visible/devcard:scale-105 group-focus-visible/devcard:border-primary/50 group-focus-visible/devcard:text-primary group-hover/devcard:scale-105 group-hover/devcard:border-primary/50 group-hover/devcard:text-primary">
        {dev.initials}
      </div>

      <div className="relative mt-5 translate-y-1 opacity-0 transition-[opacity,transform] duration-300 ease-out group-focus-visible/devcard:translate-y-0 group-focus-visible/devcard:opacity-100 group-hover/devcard:translate-y-0 group-hover/devcard:opacity-100">
        <p className="font-medium text-foreground">{dev.name}</p>
        <p className="mt-1 text-muted-foreground text-xs">{dev.role}</p>
      </div>

      {/* rest-state hint, fades out on hover/focus as the identity fades in */}
      <p className="-translate-y-1 absolute font-mono text-[0.65rem] text-muted-foreground/60 uppercase tracking-[0.2em] transition-[opacity,transform] duration-300 ease-out group-focus-visible/devcard:pointer-events-none group-focus-visible/devcard:translate-y-1 group-focus-visible/devcard:opacity-0 group-hover/devcard:pointer-events-none group-hover/devcard:translate-y-1 group-hover/devcard:opacity-0">
        Hover to reveal
      </p>
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
];

/** Glassmorphism detail modal — frosted translucent panel over the
 *  backdrop's own blur/glow, Radix Dialog underneath for focus trap,
 *  escape-to-close, and scroll lock. */
function DevModal({
  dev,
  onOpenChange,
  open,
}: {
  dev: Dev | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {dev && (
        <DialogContent
          className={cn(
            "max-w-sm rounded-2xl border border-border/60 bg-card/50 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl",
            "supports-backdrop-filter:bg-card/30"
          )}
          showCloseButton={true}
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-primary/40 bg-secondary/80 font-display text-2xl text-primary">
            {dev.initials}
          </div>
          <DialogTitle className="mt-5 font-display text-foreground text-xl">
            {dev.name}
          </DialogTitle>
          <p className="mt-1 text-primary/80 text-sm">{dev.role}</p>
          <DialogDescription className="mt-4 text-muted-foreground text-sm leading-relaxed">
            {dev.bio}
          </DialogDescription>
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
        </DialogContent>
      )}
    </Dialog>
  );
}

export function DevGrid({ devs }: { devs: Dev[] }) {
  const [activeDev, setActiveDev] = useState<Dev | null>(null);

  return (
    <>
      <motion.div
        animate="visible"
        className="grid grid-cols-2 gap-5 sm:grid-cols-4"
        initial="hidden"
        variants={staggerContainer}
      >
        {devs.map((dev) => (
          <DevCard dev={dev} key={dev.name} onOpen={() => setActiveDev(dev)} />
        ))}
      </motion.div>

      <DevModal
        dev={activeDev}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDev(null);
          }
        }}
        open={activeDev !== null}
      />
    </>
  );
}
