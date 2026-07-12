"use client";

import {
  MagicBentoCard,
  MagicBentoGrid,
} from "@workspace/ui/components/marketing/MagicBento";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowRight,
  Bot,
  Brain,
  Eye,
  GitBranch,
  ListChecks,
  Network,
  SquareTerminal,
  Workflow,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { FeaturesBackdrop } from "../components/features-backdrop";
import { Badge, CtaLink, Eyebrow, GlowCard } from "../components/marketing-kit";
import {
  revealVariants,
  staggerContainer,
} from "../components/motion-primitives";
import { ParallaxField } from "../components/parallax-field";
import { Terminal, type TerminalLineInput } from "../components/terminal";

/* ── Feature grid — every capability, one card each ───────── */

const features = [
  {
    icon: Bot,
    title: "AI Agent Swarm",
    description:
      "Spin up a fleet of autonomous agents that divide work and conquer it in parallel.",
  },
  {
    icon: Workflow,
    title: "Autonomous Coding",
    description:
      "Agents write, refactor, and review real code on real branches — end to end.",
  },
  {
    icon: SquareTerminal,
    title: "Terminal Multiplexer",
    description:
      "A 16-pane terminal grid in the browser. Every agent works in a shell you can open.",
  },
  {
    icon: Zap,
    title: "Parallel Execution",
    description:
      "Tasks fan out across agents and terminals simultaneously — no queue, no waiting.",
  },
  {
    icon: ListChecks,
    title: "Task Planning",
    description:
      "Agents break epics into ordered, dependency-aware task graphs before touching code.",
  },
  {
    icon: Network,
    title: "Multi-Agent Collaboration",
    description:
      "Agents hand off outputs, share context, and resolve dependencies between each other.",
  },
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description:
      "Live execution traces on the canvas overlay — watch every decision as it happens.",
  },
  {
    icon: GitBranch,
    title: "Git Integration",
    description:
      "Isolated worktrees per agent, clean diffs, and PRs opened automatically when done.",
  },
  {
    icon: Brain,
    title: "AI Memory",
    description:
      "Agents remember your conventions, past decisions, and project context across sessions.",
  },
];

/* Mini status chips inside the "AI Agent Swarm" hero cell — a quick
   read of what the swarm is doing, in the same voice as the hero
   ticker copy elsewhere on the site. */
const SWARM_TILES = [
  { icon: Bot, label: "Agents" },
  { icon: SquareTerminal, label: "Terminals" },
  { icon: GitBranch, label: "Branches" },
  { icon: Network, label: "Sync" },
];

/* ── 3D showcase cards — the three pillars, oversized ──────── */

const pillars = [
  {
    icon: Bot,
    tag: "Orchestrate",
    title: "One prompt, a whole team",
    description:
      "Describe the outcome. Hyperion plans the work, assigns agents, and runs them in parallel — you watch it converge on the task board.",
    beam: true,
  },
  {
    icon: SquareTerminal,
    tag: "Inspect",
    title: "Nothing happens off-screen",
    description:
      "Every agent action lands in a real terminal pane. Scroll back, interrupt, or take over the shell at any moment.",
    beam: true,
  },
  {
    icon: GitBranch,
    tag: "Ship",
    title: "From task to merged PR",
    description:
      "Agents work isolated worktrees, run the tests, and open reviewable pull requests. You keep the merge button.",
    beam: true,
  },
];

const DEMO_LINES: TerminalLineInput[] = [
  { text: '$ hyperion agents plan "add rate limiting to the API"' },
  { text: "" },
  { text: "planning     4 tasks · 2 can run in parallel", status: "info" },
  { text: "01  design limiter middleware        agent-01" },
  { text: "02  implement token bucket           agent-02" },
  { text: "03  wire into router  (needs 01,02)  agent-01" },
  { text: "04  integration tests (needs 03)     agent-03" },
  { text: "" },
  { text: "dispatching  3 agents · 3 terminals attached", status: "info" },
  { text: "" },
  { text: "agent-02 › src/middleware/bucket.ts    +214 −0" },
  { text: "agent-01 › src/middleware/limiter.ts   +96 −4" },
  { text: "agent-03 › tests/rate-limit.test.ts    48 passed" },
  { text: "" },
  { text: "PR #219 ready for review · 22 min end to end", status: "success" },
];

export default function FeaturesPage() {
  return (
    <div className="relative">
      <ParallaxField />
      <FeaturesBackdrop />

      {/* Hero */}
      <section className="relative z-10 pt-36 pb-12">
        <motion.div
          animate="visible"
          className="relative mx-auto max-w-3xl px-6 text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          <motion.h1
            className="mt-3 font-display text-4xl text-foreground tracking-tighter md:text-6xl"
            variants={revealVariants}
          >
            Everything an AI workforce needs.
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
            variants={revealVariants}
          >
            Orchestration, terminals, planning, memory, and git — engineered
            into one workspace so agents can do real engineering.
          </motion.p>
        </motion.div>
      </section>

      {/* 3D showcase pillars */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal direction="up" duration={320} index={i} key={pillar.title}>
              <GlowCard beam={pillar.beam} className="flex h-full flex-col p-8">
                <Badge className="w-fit">{pillar.tag}</Badge>
                <div className="mt-6 flex size-12 items-center justify-center rounded-xl border border-border bg-secondary transition-colors duration-300 group-hover/card:border-primary/40">
                  <pillar.icon className="size-6 text-primary transition-transform duration-300 ease-out group-hover/card:-rotate-3 group-hover/card:scale-110" />
                </div>
                <h2 className="mt-5 font-display font-semibold text-2xl tracking-tight">
                  {pillar.title}
                </h2>
                <p className="mt-3 flex-1 text-muted-foreground text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <Reveal direction="up" duration={250}>
          <div className="text-center">
            <Eyebrow className="justify-center">The full surface</Eyebrow>
            <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
              Twelve capabilities. Zero context switching.
            </h2>
          </div>
        </Reveal>
        <MagicBentoGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            // Bento mosaic (lg+ only): the flagship first tile is a
            // large 2x2 cell; the remaining eight stay standard size,
            // filling out a clean 4-row x 3-col grid with no gaps.
            const isHero = i === 0;
            return (
              <Reveal
                className={cn(isHero && "lg:col-span-2 lg:row-span-2")}
                direction="up"
                duration={280}
                index={i % 3}
                key={feature.title}
              >
                <MagicBentoCard
                  className={cn("flex h-full flex-col p-6", isHero && "lg:p-8")}
                  enableMagnetism={false}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-xl border border-border bg-secondary transition-colors duration-300 group-hover/card:border-primary/40",
                      isHero ? "size-14" : "size-11"
                    )}
                  >
                    <feature.icon
                      className={cn(
                        "text-primary transition-transform duration-300 ease-out group-hover/card:-rotate-3 group-hover/card:scale-110",
                        isHero ? "size-6" : "size-5"
                      )}
                    />
                  </div>
                  <h3
                    className={cn(
                      "mt-4 font-medium text-foreground",
                      isHero && "text-lg"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  {isHero && (
                    <div className="mt-6 grid grid-cols-2 gap-2">
                      {SWARM_TILES.map((tile) => (
                        <div
                          className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5"
                          key={tile.label}
                        >
                          <tile.icon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate text-muted-foreground text-xs">
                            {tile.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </MagicBentoCard>
              </Reveal>
            );
          })}
        </MagicBentoGrid>
      </section>

      {/* Live demo terminal */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <Reveal direction="up" duration={250}>
          <div className="text-center">
            <Eyebrow className="justify-center">Interactive demo</Eyebrow>
            <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
              A real task, start to finish
            </h2>
          </div>
        </Reveal>
        <div className="mt-10">
          <Terminal
            lines={DEMO_LINES}
            shell="zsh"
            title="hyperion — agents"
            typing={true}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pt-6 pb-24 text-center md:pb-32">
        <Reveal direction="up" duration={300}>
          <h2 className="text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
            See it on your own codebase.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CtaLink className="group h-11 px-6" href="/download">
              Download Hyperion
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </CtaLink>
            <CtaLink className="h-11 px-6" href="/docs" variant="ghost">
              Read the docs
            </CtaLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
