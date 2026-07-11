"use client";

import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { ArrowRight, Compass, GitFork, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { CtaLink, Eyebrow, GlowCard } from "../components/marketing-kit";
import {
  Counter,
  revealVariants,
  staggerContainer,
} from "../components/motion-primitives";

const principles = [
  {
    icon: Compass,
    title: "Vision",
    description:
      "Software that builds software. We think the next order-of-magnitude gain in engineering isn't a faster editor — it's a workforce of agents you direct instead of keystrokes you type.",
  },
  {
    icon: Sparkles,
    title: "Mission",
    description:
      "Give every developer a team. Hyperion turns one person into an orchestrator of parallel agents — planning, coding, testing, and shipping under human command.",
  },
  {
    icon: GitFork,
    title: "Open Source",
    description:
      "The workspace of the AI era shouldn't be a black box. Hyperion is built in the open — inspectable agents, local execution, and a codebase you can read and fork.",
  },
];

const beliefs = [
  {
    title: "AI-first, human-final",
    body: "Agents do the work; people make the calls. Every diff is reviewable, every action lands in a terminal you can open, and the merge button stays yours.",
  },
  {
    title: "Autonomy needs visibility",
    body: "Autonomous systems earn trust by being observable. Live traces, real shells, and a board that never lies are not features — they're the contract.",
  },
  {
    title: "Local by default",
    body: "Your code is your code. Execution happens on your machine, in your worktrees, with your keys. Nothing leaves unless you push it.",
  },
  {
    title: "Parallel is the point",
    body: "One agent is a novelty. Six agents, coordinating over a shared task graph across a grid of terminals — that's a new way to build.",
  },
];

const stats = [
  { value: 8, suffix: "", label: "terminal panes per grid" },
  { value: 8, suffix: "", label: "agents per swarm" },
  { value: 40, suffix: "+", label: "OKLCh themes shipped" },
  { value: 100, suffix: "%", label: "open source" },
];

const timeline = [
  {
    date: "April 2026",
    title: "The idea",
    body: "Terminals, editors, and task boards were built for a world without agents. We start sketching a workspace designed around them.",
  },
  {
    date: "May 2026",
    title: "First swarm",
    body: "Three agents resolve a dependency graph across tiled terminals for the first time. The canvas overlay is born to watch them think.",
  },
  {
    date: "June 2026",
    title: "Theme engine & task board",
    body: "The drag-to-dispatch kanban ships alongside 40+ OKLCh themes and the dependency resolution engine deep dive.",
  },
  {
    date: "July 2026",
    title: "v0.1.0 public release",
    body: "The 16-pane multiplexer, agent dispatch, and execution traces go public. One developer, an entire engineering team.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative pt-36 pb-14">
        <div
          aria-hidden={true}
          className="landing-glow-breathe pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent)_0%,transparent_70%)]"
        />
        <motion.div
          animate="visible"
          className="mx-auto max-w-3xl px-6 text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          <motion.h1
            className="mt-3 font-display text-4xl text-foreground tracking-tighter md:text-6xl"
            variants={revealVariants}
          >
            We're building the workspace where software builds itself.
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
            variants={revealVariants}
          >
            Hyperion exists because the tools of the last era — one human, one
            editor, one cursor — can't carry the next one.
          </motion.p>
        </motion.div>
      </section>

      {/* Vision / Mission / Open source */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal direction="up" duration={300} index={i} key={p.title}>
              <GlowCard className="h-full p-8">
                <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary transition-colors duration-300 group-hover/card:border-primary/40">
                  <p.icon className="size-5 text-primary transition-transform duration-300 ease-out group-hover/card:-rotate-3 group-hover/card:scale-110" />
                </div>
                <h2 className="mt-5 font-display font-semibold text-xl tracking-tight">
                  {p.title}
                </h2>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                  {p.description}
                </p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Animated stats */}
      <section className="landing-band-fade bg-card/20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 md:divide-x md:divide-border/60">
          {stats.map((stat, i) => (
            <Reveal direction="up" duration={300} index={i} key={stat.label}>
              <div className="group flex flex-col items-center gap-1.5 px-4 py-10 text-center">
                <span className="font-display text-4xl text-foreground transition-colors duration-300 group-hover:text-primary md:text-5xl">
                  <Counter suffix={stat.suffix} target={stat.value} />
                </span>
                <span className="text-muted-foreground text-sm">
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal direction="up" duration={250}>
          <div className="text-center">
            <Eyebrow className="justify-center">Philosophy</Eyebrow>
            <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
              What we hold true
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {beliefs.map((belief, i) => (
            <Reveal
              direction="up"
              duration={280}
              index={i % 2}
              key={belief.title}
            >
              <GlowCard className="h-full p-7" tilt={false}>
                <h3 className="font-medium text-foreground">{belief.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {belief.body}
                </p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-6 pb-16 md:pb-24">
        <Reveal direction="up" duration={250}>
          <div className="text-center">
            <Eyebrow className="justify-center">Timeline</Eyebrow>
            <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
              From sketch to swarm
            </h2>
          </div>
        </Reveal>
        <ol className="relative mt-12 space-y-10 border-border/60 border-l pl-8">
          {timeline.map((item, i) => (
            <Reveal direction="up" duration={280} index={i} key={item.title}>
              <li className="relative">
                <span
                  aria-hidden={true}
                  className="absolute top-1.5 -left-[37px] flex size-4 items-center justify-center rounded-full border border-primary/40 bg-background"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                </span>
                <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.15em]">
                  {item.date}
                </p>
                <h3 className="mt-1.5 font-medium text-foreground text-lg">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                  {item.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center md:pb-32">
        <Reveal direction="up" duration={300}>
          <h2 className="text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
            Build the future with us.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CtaLink className="group h-11 px-6" href="/download">
              Download Hyperion
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </CtaLink>
            <CtaLink className="h-11 px-6" href="/contact" variant="ghost">
              Get in touch
            </CtaLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
