"use client";

import { siteConfig } from "@workspace/core/config/site";
import { fetchLatestGithubVersion } from "@workspace/core/lib/utils";
import { BorderBeam } from "@workspace/ui/components/landing/border-beam";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowRight,
  Bot,
  Check,
  LayoutGrid,
  Play,
  Rocket,
  SquareKanban,
  SquareTerminal,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { CodeBlock, CtaLink, Eyebrow, GlowCard } from "./marketing-kit";
import { Counter, easeOut, Marquee } from "./motion-primitives";

/* ── Copy ─────────────────────────────────────────────────── */

/* Words from HEADLINE_HIGHLIGHT_FROM onward get the amber shimmer —
   the payoff phrase, what the swarm does for you. */
const HEADLINE = ["You", "command.", "Agents", "build."];
const HEADLINE_HIGHLIGHT_FROM = 2;

const SUBHEAD =
  "Hyperion is the agentic workspace where a swarm of AI agents plans, codes, tests, and ships across dozens of terminals — turning one developer into an entire engineering team.";

const TICKER_MESSAGES = [
  "agent-02 refactored auth middleware · just now",
  "agent-05 opened PR #214 · 4s ago",
  "agent-03 ran 148 tests — all passing · 12s ago",
  "swarm: 6 agents active across 12 terminals",
  "agent-01 resolved a merge conflict · 30s ago",
];

const CAPABILITIES = [
  "Terminal Multiplexer",
  "AI Agent Swarm",
  "Task Board",
  "Workspace Tiling",
  "Git Worktrees",
  "Live Previews",
  "Autonomous PRs",
  "Local-first",
];

const STATS = [
  { value: 12, suffix: "+", label: "terminals in one workspace" },
  { value: 24, suffix: "/7", label: "autonomous operation" },
  { value: 4, suffix: "×", label: "faster iteration loops" },
  { value: 100, suffix: "%", label: "under your command" },
];

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Workspace System",
    description: "Tile terminals, editors, and previews into one adaptive canvas.",
    href: "/product",
  },
  {
    icon: SquareTerminal,
    title: "Terminal Multiplexer",
    description: "Run and manage dozens of shells side by side without leaving the browser.",
    href: "/coding",
  },
  {
    icon: Bot,
    title: "AI Agent Swarm",
    description: "Delegate tasks to autonomous agents that work your codebase in parallel.",
    href: "/coding",
  },
  {
    icon: SquareKanban,
    title: "Task Board",
    description: "Every agent's task tracked on a live kanban you can reorder mid-flight.",
    href: "/product",
  },
];

const SWARM_CHECKLIST = [
  "Agents plan, code, test, and review in parallel",
  "Every action lands in a terminal you can inspect",
  "The task board tracks the swarm in real time",
  "Interrupt, redirect, or take over at any moment",
];

const TERMINAL_CODE = `$ hyperion swarm start --agents 4

✓ workspace attached — 4 terminals tiled
● agent-01  planning   → roadmap.md
● agent-02  coding     → src/auth/session.ts
● agent-03  testing    → 148 passed, 0 failed
● agent-04  reviewing  → PR #214 approved

swarm active · 4 agents · you are in command`;

/* Deterministic particle field — fixed values (no Math.random) so the
   server and client render identical markup. */
const PARTICLES = [
  { left: "8%", top: "22%", size: 3, dur: "13s", delay: "0s", x: "12px" },
  { left: "16%", top: "58%", size: 2, dur: "17s", delay: "-4s", x: "-10px" },
  { left: "24%", top: "34%", size: 2, dur: "15s", delay: "-9s", x: "8px" },
  { left: "36%", top: "70%", size: 3, dur: "19s", delay: "-2s", x: "-14px" },
  { left: "48%", top: "18%", size: 2, dur: "14s", delay: "-6s", x: "10px" },
  { left: "58%", top: "62%", size: 2, dur: "18s", delay: "-11s", x: "-8px" },
  { left: "66%", top: "28%", size: 3, dur: "16s", delay: "-3s", x: "14px" },
  { left: "74%", top: "54%", size: 2, dur: "20s", delay: "-8s", x: "-12px" },
  { left: "84%", top: "36%", size: 2, dur: "15s", delay: "-5s", x: "10px" },
  { left: "92%", top: "64%", size: 3, dur: "17s", delay: "-12s", x: "-10px" },
];

/* ── Micro components ─────────────────────────────────────── */

/** One headline word — blur-to-sharp rise, staggered by index. */
function Word({
  children,
  delay,
  highlight = false,
}: {
  children: string;
  delay: number;
  highlight?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className={cn(
        "inline-block will-change-transform",
        highlight &&
          "landing-shimmer bg-clip-text bg-gradient-to-r from-primary via-[#ffc199] to-primary text-transparent"
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 20, filter: "blur(12px)" }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
    >
      {children}
    </motion.span>
  );
}

/** Rotating one-line feed of swarm activity under the CTAs. */
function AgentTicker() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % TICKER_MESSAGES.length),
      2800
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-8 flex h-6 items-center justify-center gap-2.5 font-mono text-muted-foreground text-xs">
      <span className="relative flex size-1.5 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          key={index}
          transition={{ duration: 0.25, ease: easeOut }}
        >
          {TICKER_MESSAGES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Concentric orbit rings with accent dots circling a pulsing core —
 *  the swarm, abstracted. Pure CSS rotation, transform-only. */
function SwarmOrbit() {
  const rings = [
    { size: "38%", dur: "14s", dots: 1, reverse: false },
    { size: "64%", dur: "22s", dots: 2, reverse: true },
    { size: "90%", dur: "32s", dots: 3, reverse: false },
  ];

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
      {rings.map((ring) => (
        <div
          className="absolute rounded-full border border-border/70"
          key={ring.size}
          style={{ width: ring.size, height: ring.size }}
        >
          <div
            className={cn(
              "landing-orbit absolute inset-0",
              ring.reverse && "landing-orbit-reverse"
            )}
            style={{ "--orbit-dur": ring.dur } as CSSProperties}
          >
            {Array.from({ length: ring.dots }).map((_, di) => (
              <div
                className="absolute inset-0"
                // biome-ignore lint/suspicious/noArrayIndexKey: static decorative dots
                key={di}
                style={{ transform: `rotate(${(360 / ring.dots) * di}deg)` }}
              >
                <span className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 size-2 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/50" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Core */}
      <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-secondary shadow-[0_0_40px_-8px] shadow-primary/40">
        <Bot className="size-7 text-primary" />
        <span
          aria-hidden={true}
          className="landing-glow-breathe -z-10 absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
        />
      </div>

      {/* Floating agent chips */}
      <span
        className="landing-float absolute top-[16%] left-[4%] rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
        style={{ "--float-dur": "6s" } as CSSProperties}
      >
        agent-02 · coding
      </span>
      <span
        className="landing-float absolute top-[42%] right-[2%] rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
        style={{ "--float-dur": "7s", "--float-delay": "-2.5s" } as CSSProperties}
      >
        agent-04 · reviewing
      </span>
      <span
        className="landing-float absolute bottom-[12%] left-[10%] rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
        style={{ "--float-dur": "5.5s", "--float-delay": "-4s" } as CSSProperties}
      >
        agent-01 · testing
      </span>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function HeroSection() {
  const [latestTag, setLatestTag] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const shotRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: shotRef,
    offset: ["start end", "start 0.35"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  useEffect(() => {
    fetchLatestGithubVersion().then((tag) => {
      if (tag) {
        setLatestTag(tag);
      }
    });
  }, []);

  return (
    <main className="overflow-hidden bg-background">
      {/* ── Hero ── */}
      <section className="relative">
        {/* Breathing single-tone glow */}
        <div
          aria-hidden={true}
          className="landing-glow-breathe -z-10 pointer-events-none absolute inset-x-0 top-0 h-[640px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent)_0%,transparent_70%)]"
        />
        {/* Faint blueprint grid, masked so it dissolves before content */}
        <div
          aria-hidden={true}
          className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-[0.14] [background:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_62%_52%_at_50%_0%,#000_55%,transparent_100%)]"
        />
        {/* Drifting accent particles */}
        <div aria-hidden={true} className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[640px]">
          {PARTICLES.map((p) => (
            <span
              className="landing-drift absolute rounded-full bg-primary/60"
              key={`${p.left}-${p.top}`}
              style={
                {
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  "--drift-dur": p.dur,
                  "--drift-delay": p.delay,
                  "--drift-x": p.x,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative pt-28 md:pt-40">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              {/* Announcement pill */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={reduceMotion ? false : { opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                <Link
                  className="group mx-auto flex w-fit items-center gap-4 rounded-full border border-border bg-card p-1 pl-4 shadow-black/30 shadow-lg transition-colors duration-300 hover:border-primary/40 hover:bg-secondary"
                  href={siteConfig.links.releases}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="text-foreground/80 text-sm">
                    {latestTag
                      ? `${siteConfig.name} v${latestTag} Released`
                      : `${siteConfig.name} is live`}
                  </span>
                  <span className="block h-4 w-0.5 border-border border-l" />
                  <div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
                    <div className="-translate-x-1/2 flex w-12 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Headline — per-word blur reveal, amber shimmer on the payoff word */}
              <h1 className="mx-auto mt-8 max-w-4xl text-balance font-display text-5xl tracking-tight max-md:font-semibold md:text-7xl lg:mt-14 xl:text-[5.25rem]">
                {HEADLINE.map((word, i) => (
                  <Fragment key={word}>
                    <Word
                      delay={0.15 + i * 0.1}
                      highlight={i >= HEADLINE_HIGHLIGHT_FROM}
                    >
                      {word}
                    </Word>{" "}
                  </Fragment>
                ))}
              </h1>

              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-8 max-w-3xl text-balance text-lg text-muted-foreground"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                transition={{ duration: 0.6, delay: 0.65, ease: easeOut }}
              >
                {SUBHEAD}
              </motion.p>

              {/* CTAs — magnetic pills with arrow slide-in */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                transition={{ duration: 0.6, delay: 0.8, ease: easeOut }}
              >
                <CtaLink className="group h-12 px-6 text-base" href="/home">
                  <Play className="size-4" />
                  View Web Demo
                  <ArrowRight className="-ml-1 -translate-x-1 size-4 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                </CtaLink>
                <CtaLink
                  className="group h-12 px-6 text-base"
                  href="/docs/quick-start"
                  variant="ghost"
                >
                  <Rocket className="size-4 transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110" />
                  Start Building
                </CtaLink>
              </motion.div>

              {/* Live swarm feed */}
              <motion.div
                animate={{ opacity: 1 }}
                initial={reduceMotion ? false : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <AgentTicker />
              </motion.div>
            </div>
          </div>

          {/* Screenshot — scroll-linked 3D untilt with orbiting border light */}
          <Reveal direction="up" duration={450} offset={48}>
            <div
              className="mask-b-from-55% -mr-56 relative mt-10 overflow-hidden px-2 [perspective:1200px] sm:mr-0 sm:mt-14 md:mt-20"
              ref={shotRef}
            >
              <motion.div
                className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-card/40 p-4 shadow-2xl shadow-black/40 will-change-transform"
                style={{ rotateX, scale, transformPerspective: 1200 }}
              >
                <Image
                  alt="Hyperion workspace screenshot"
                  className="relative aspect-15/8 rounded-2xl border border-border/50"
                  height="1080"
                  priority={true}
                  src="/app-screen-dark.png"
                  width="1920"
                />
                <BorderBeam
                  className="from-transparent via-primary to-transparent"
                  duration={6}
                  size={200}
                />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Capability ticker ── */}
      <section className="border-border/60 border-y py-5">
        <Marquee speed={38}>
          {CAPABILITIES.map((cap) => (
            <span
              className="mx-4 flex items-center gap-8 whitespace-nowrap text-muted-foreground/70 text-xs uppercase tracking-[0.25em]"
              key={cap}
            >
              {cap}
              <span aria-hidden={true} className="size-1 rounded-full bg-primary/50" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── Stats ── */}
      <section className="bg-card/20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 md:divide-border/60 md:divide-x">
          {STATS.map((stat, i) => (
            <Reveal direction="up" duration={300} index={i} key={stat.label}>
              <div className="group flex flex-col items-center gap-1.5 px-4 py-10 text-center">
                <span className="font-display text-4xl text-foreground transition-colors duration-300 group-hover:text-primary md:text-5xl">
                  <Counter suffix={stat.suffix} target={stat.value} />
                </span>
                <span className="text-muted-foreground text-sm">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal direction="up" duration={250}>
          <div className="text-center">
            <Eyebrow className="justify-center">Inside the workspace</Eyebrow>
            <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
              One canvas. Every tool.
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal direction="up" duration={280} index={i} key={feature.title}>
              <GlowCard className="h-full p-6">
                <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary transition-colors duration-300 group-hover/card:border-primary/40">
                  <feature.icon className="group-hover/card:-rotate-3 size-5 text-primary transition-transform duration-300 ease-out group-hover/card:scale-110" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
                <Link
                  className="group/link mt-4 inline-flex items-center gap-1 text-primary text-sm"
                  href={feature.href}
                >
                  Explore
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Swarm section ── */}
      <section className="border-border/60 border-t bg-card/20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <Reveal direction="up" duration={250}>
              <Eyebrow>Agent swarm</Eyebrow>
              <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
                A team that never sleeps
              </h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                Spin up autonomous agents and hand them real work. Each one runs
                in its own terminal, on its own branch, reporting back to a
                board you control.
              </p>
            </Reveal>
            <ul className="mt-8 space-y-4">
              {SWARM_CHECKLIST.map((item, i) => (
                <Reveal direction="up" duration={240} index={i} key={item}>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span className="text-foreground/85 text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal direction="up" duration={240} index={SWARM_CHECKLIST.length}>
              <CtaLink className="group mt-8 h-10 px-5" href="/coding" variant="ghost">
                See how agents work
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </CtaLink>
            </Reveal>
          </div>
          <Reveal direction="up" duration={350} offset={36}>
            <SwarmOrbit />
          </Reveal>
        </div>
      </section>

      {/* ── Live terminal ── */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal direction="up" duration={250}>
          <div className="text-center">
            <Eyebrow className="justify-center">Live from a workspace</Eyebrow>
            <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
              Watch the swarm work
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl">
          <CodeBlock
            code={TERMINAL_CODE}
            header="hyperion — swarm"
            language="shell"
            typing={true}
          />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-6 pb-20 md:pb-28">
        <Reveal direction="up" duration={350} offset={36}>
          <GlowCard beam={true} className="p-10 text-center md:p-16" tilt={false}>
            <h2 className="text-balance font-display font-semibold text-3xl tracking-tight md:text-5xl">
              Stop typing. Start orchestrating.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Download {siteConfig.name} and put a swarm of agents to work on
              your codebase today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaLink className="group h-11 px-6" href="/download">
                Download {siteConfig.name}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </CtaLink>
              <CtaLink className="h-11 px-6" href="/docs" variant="ghost">
                Read the docs
              </CtaLink>
            </div>
          </GlowCard>
        </Reveal>
      </section>
    </main>
  );
}
