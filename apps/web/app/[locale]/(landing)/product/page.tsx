"use client";

import { motion, useReducedMotion } from "motion/react";
import { Bot, Box, Columns3, GitBranch, Keyboard, Layout, Palette, Sparkles } from "lucide-react";
import { BorderBeam } from "@workspace/ui/components/landing/border-beam";
import {
  Counter,
  Marquee,
  ProgressLine,
  revealVariants,
  staggerContainer,
} from "../components/motion-primitives";
import { CtaLink, Eyebrow, GlowCard } from "../components/marketing-kit";

const previewTiles = [
  { icon: Layout, label: "Workspace", active: true },
  { icon: Columns3, label: "Task Board", active: false },
  { icon: Box, label: "Canvas", active: false },
  { icon: Palette, label: "Themes", active: false },
];

/** WorkspacePreview — an abstract mockup of the tiled workspace, standing
 * in for a real screenshot. Fills the hero's empty right column and gives
 * Product its own visual language (Coding gets a terminal, Home gets the
 * app screenshot, Product gets this). */
function WorkspacePreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 p-5 shadow-2xl shadow-black/40">
        <div className="grid grid-cols-2 gap-3">
          {previewTiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <motion.div
                className={`relative flex aspect-[4/3] flex-col justify-between rounded-xl border p-3 ${
                  tile.active
                    ? "border-primary/40 bg-secondary"
                    : "border-border bg-background/40"
                }`}
                initial={{ opacity: 0, y: 12 }}
                key={tile.label}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-40px" }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={`size-4 ${tile.active ? "text-primary" : "text-muted-foreground"}`}
                  />
                  {tile.active && (
                    <span className="relative flex size-1.5">
                      {!reduceMotion && (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                      )}
                      <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  {tile.label}
                </span>
              </motion.div>
            );
          })}
        </div>
        <BorderBeam
          className="from-transparent via-primary to-transparent"
          duration={7}
          size={160}
        />
      </div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        className="-top-4 -right-4 absolute hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-black/30 shadow-lg md:flex"
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Bot className="size-3.5 text-primary" />
        <span className="text-foreground/80 text-xs">Agent active</span>
      </motion.div>
    </div>
  );
}

const taglines: string[] = [
  "Agentic workspace  ·  AI-native IDE  ·  Multi-pane terminal  ·  Visual canvas  ·  40+ themes  ·  ",
];

const features = [
  {
    icon: Layout,
    title: "Workspace System",
    description:
      "A unified interface combining multi-pane terminals, code editor, file browser, and canvas overlay — all in one window. Organize your tools the way you think.",
  },
  {
    icon: Columns3,
    title: "Task Board",
    description:
      "Drag-and-drop Kanban board powered by @dnd-kit. Create tasks, assign them to AI agents, and watch them resolve in real-time through the terminal grid.",
  },
  {
    icon: Box,
    title: "Canvas Overlay",
    description:
      "A real-time visual layer showing agent execution traces, dependency graphs, and system topology. Watch your agents think as they work.",
  },
  {
    icon: Palette,
    title: "Theme Engine",
    description:
      "40+ OKLCh-based themes that adapt to your environment — light, dark, high-contrast, and every shade in between. Zero-config color harmony.",
  },
  {
    icon: Keyboard,
    title: "Command Palette",
    description:
      "⌘+K opens a command palette for everything — dispatch agents, run terminal commands, switch themes, navigate files. Keyboard-first by design.",
  },
  {
    icon: GitBranch,
    title: "Agent Swarm Pipeline",
    description:
      "Chain multiple agents into pipelines. One agent writes code, another tests it, a third deploys — all coordinated through the task board with full traceability.",
  },
];

const timeline = [
  { year: "Q1 2025", title: "Multi-pane terminal", desc: "16-pane xterm.js terminal grid with drag-and-drop layout engine.", icon: Layout },
  { year: "Q2 2025", title: "Kanban task board", desc: "@dnd-kit powered board with drag-to-dispatch agent integration.", icon: Columns3 },
  { year: "Q3 2025", title: "AI agent swarm", desc: "Autonomous agent dispatch, dependency resolution, and pipeline chaining.", icon: Bot },
  { year: "Q4 2025", title: "Canvas overlay", desc: "Real-time agent execution traces and system topology visualization.", icon: Box },
  { year: "2026+", title: "Community & ecosystem", desc: "Plugin system, custom agent runtimes, and collaborative workspaces.", icon: Sparkles },
];

export default function ProductPage() {
  return (
    <>
      {/* Hero — dark, editorial, single accent glow */}
      <section className="relative overflow-hidden pt-36 pb-24 md:pb-32">
        <div
          aria-hidden={true}
          className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[560px] [background:radial-gradient(55%_55%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent)_0%,transparent_70%)] landing-glow-breathe"
        />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              animate="visible"
              initial="hidden"
              variants={staggerContainer}
            >
              <motion.div variants={revealVariants}>
                <Eyebrow>Hyperion Workspace</Eyebrow>
              </motion.div>
              <motion.h1
                className="mt-3 font-display text-5xl text-foreground leading-[1.05] tracking-tighter md:text-6xl lg:text-7xl"
                variants={revealVariants}
              >
                The agentic dev workspace.
              </motion.h1>
              <motion.p
                className="mt-6 max-w-xl text-lg text-muted-foreground"
                variants={revealVariants}
              >
                Terminals, agents, code, and canvas — unified in one
                keyboard-first environment. Built for the age of autonomous
                software development.
              </motion.p>
              <motion.div className="mt-8 flex flex-wrap gap-3" variants={revealVariants}>
                <CtaLink href="/contact">Get early access</CtaLink>
                <CtaLink href="/coding" variant="ghost">
                  Explore terminal
                </CtaLink>
              </motion.div>
            </motion.div>

            <WorkspacePreview />
          </div>
        </div>
      </section>

      {/* Marquee ticker */}
      <section className="border-border border-y py-4">
        <Marquee className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" pauseOnHover={false} speed={45}>
          <div className="flex items-center gap-8 px-4">
            {taglines[0]?.split("·").map((item, i) => (
              <span
                className="whitespace-nowrap font-medium text-muted-foreground text-sm"
                key={i}
              >
                {item.trim()}
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      {/* Stat counters */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { target: 16, suffix: "+", label: "Tiled terminals" },
            { target: 40, suffix: "+", label: "OKLCh themes" },
            { target: 0, suffix: "ms", label: "Cold start" },
            { target: 100, suffix: "%", label: "Open source" },
          ].map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-display text-5xl text-primary tracking-tight md:text-6xl">
                <Counter suffix={stat.suffix} target={stat.target} />
              </p>
              <p className="mt-2 text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <ProgressLine trackClass="mx-auto max-w-7xl" />

      {/* Feature grid — glow cards with cursor-follow highlight */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <motion.div
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={revealVariants}>
                <GlowCard className="h-full p-8">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary transition-colors duration-300 group-hover/card:border-primary/40">
                    <Icon className="size-5 text-primary transition-transform duration-300 ease-out group-hover/card:scale-110 group-hover/card:-rotate-3" />
                  </div>
                  <h3 className="mt-5 font-medium text-foreground text-lg">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Product timeline — dark vertical rail */}
      <section className="border-border border-t bg-card/30 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <Eyebrow>Roadmap</Eyebrow>
            <h2 className="mt-3 font-display text-4xl text-foreground tracking-tight md:text-5xl">
              Product timeline
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From terminal multiplexer to full agentic workspace — the journey
              so far.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-2xl space-y-10">
            <div className="absolute top-5 bottom-5 left-5 w-px bg-gradient-to-b from-primary/50 via-border to-transparent" />

            {timeline.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  className="relative flex gap-5"
                  initial={{ opacity: 0, y: 20 }}
                  key={item.year}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  viewport={{ once: true, margin: "-60px" }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 pt-1.5 pb-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-medium text-foreground text-lg">
                        {item.title}
                      </h3>
                      <span className="font-medium text-primary text-xs uppercase tracking-[0.2em]">
                        {item.year}
                      </span>
                    </div>
                    <p className="mt-1 max-w-md text-muted-foreground text-sm">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
