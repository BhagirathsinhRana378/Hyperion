"use client";

import { siteConfig } from "@workspace/core/config/site";
import { fetchLatestGithubVersion } from "@workspace/core/lib/utils";
import { BorderBeam } from "@workspace/ui/components/landing/border-beam";
import CountUp from "@workspace/ui/components/marketing/CountUp";
import {
  MagicBentoCard,
  MagicBentoGrid,
} from "@workspace/ui/components/marketing/MagicBento";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import ShinyText from "@workspace/ui/components/marketing/ShinyText";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowRight,
  Bot,
  Check,
  Eye,
  Github,
  LayoutGrid,
  SquareKanban,
  SquareTerminal,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { HeroBackdrop } from "./hero-backdrop";
import { CtaLink, Eyebrow, GlowCard, StatCard } from "./marketing-kit";
import { easeOut, Marquee } from "./motion-primitives";
import { Terminal, type TerminalLineInput } from "./terminal";

/* ── Copy ─────────────────────────────────────────────────── */

/* Words from HEADLINE_HIGHLIGHT_FROM onward get the shimmer sweep. */
const HEADLINE = ["Your", "AI", "Engineering", "Workspace"];
const HEADLINE_HIGHLIGHT_FROM = 3;

const SUBHEAD = "One workspace, up to  8  AI agents—code, test, ship together.";

/* Quiet glass pills in place of CTA buttons — interactive-feeling,
   not button-shaped. */
const FEATURE_PILLS = [
  { icon: Bot, label: "Multi-Agent" },
  { icon: SquareTerminal, label: "Terminal Swarm" },
  { icon: SquareKanban, label: "Parallel Tasks" },
  { icon: Zap, label: "Real-Time Execution" },
  { icon: Github, label: "Open Source" },
];

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
  {
    value: 8,
    suffix: "",
    label: "Terminals",
    description: "Tiled into one adaptive workspace.",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "Agent Uptime",
    description: "Autonomous agents that keep working.",
  },
  {
    value: 10,
    suffix: "×",
    label: "Faster Delivery",
    description: "Parallel agents cut iteration time.",
  },
  {
    value: 100,
    suffix: "%",
    label: "Under Command",
    description: "You approve every merge, always.",
  },
];

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Workspace System",
    description:
      "Tile terminals, editors, and previews into one adaptive canvas.",
    href: "/features",
  },
  {
    icon: SquareTerminal,
    title: "Terminal Multiplexer",
    description:
      "Run and manage dozens of shells side by side without leaving the browser.",
    href: "/features",
  },
  {
    icon: Bot,
    title: "AI Agent Swarm",
    description:
      "Delegate tasks to autonomous agents that work your codebase in parallel.",
    href: "/features",
  },
  {
    icon: SquareKanban,
    title: "Task Board",
    description:
      "Every agent's task tracked on a live kanban you can reorder mid-flight.",
    href: "/features",
  },
];

/* Mini tile preview inside the "Workspace System" hero cell — a
   literal small tiling of what the sentence above describes. */
const WORKSPACE_TILES = [
  { icon: SquareTerminal, label: "Terminal" },
  { icon: LayoutGrid, label: "Editor" },
  { icon: Eye, label: "Preview" },
  { icon: SquareKanban, label: "Task board" },
];

const SWARM_CHECKLIST = [
  "Agents plan, code, test, and review in parallel",
  "Every action lands in a terminal you can inspect",
  "The task board tracks the swarm in real time",
  "Interrupt, redirect, or take over at any moment",
];

const TERMINAL_LINES: TerminalLineInput[] = [
  { text: "$ hyperion swarm start --agents 4" },
  { text: "" },
  { text: "workspace attached — 4 terminals tiled", status: "success" },
  { text: "agent-01  planning   → roadmap.md", status: "info" },
  { text: "agent-02  coding     → src/auth/session.ts", status: "info" },
  { text: "agent-03  testing    → 148 passed, 0 failed", status: "info" },
  { text: "agent-04  reviewing  → PR #214 approved", status: "success" },
  { text: "" },
  { text: "swarm active · 4 agents · you are in command" },
];

/* ── Micro components ─────────────────────────────────────── */

/** One floating glass stat card — counts up once on entry, then eases
 *  into an independent slow float+rotate drift (paused on hover).
 *  Lift + tilt + scale are cursor-driven (same recipe as GlowCard) on
 *  an inner element, kept separate from the float wrapper so the two
 *  transforms never fight over the same node. Every card is the same
 *  fixed height via grid stretch + h-full all the way down, and the
 *  description reserves a fixed two-line slot so no card's content
 *  shifts the number/label baseline relative to its neighbors. */
function HeroStatCard({
  value,
  suffix,
  label,
  description,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  description: string;
  index: number;
}) {
  return (
    <Reveal className="h-full" direction="up" duration={340} index={index}>
      <StatCard>
        <span className="font-display text-4xl text-foreground md:text-5xl">
          <CountUp
            className="count-up-text"
            delay={index * 0.12}
            duration={1.3}
            separator=","
            to={value}
          />
          {suffix}
        </span>
        <span className="mt-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
          {label}
        </span>
        <span className="mt-2 flex min-h-[2.25rem] items-center justify-center text-muted-foreground/70 text-xs leading-relaxed">
          {description}
        </span>
      </StatCard>
    </Reveal>
  );
}

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
          "landing-shimmer bg-gradient-to-r from-primary via-muted-foreground to-primary bg-clip-text text-transparent"
      )}
      initial={
        reduceMotion ? false : { opacity: 0, y: 20, filter: "blur(12px)" }
      }
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
                <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/50" />
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
          className="landing-glow-breathe absolute inset-0 -z-10 rounded-2xl bg-primary/20 blur-xl"
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
        style={
          { "--float-dur": "7s", "--float-delay": "-2.5s" } as CSSProperties
        }
      >
        agent-04 · reviewing
      </span>
      <span
        className="landing-float absolute bottom-[12%] left-[10%] rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
        style={
          { "--float-dur": "5.5s", "--float-delay": "-4s" } as CSSProperties
        }
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
  // One spring drives every derived value, so the showcase moves as a
  // single weighty object — no linear interpolation anywhere.
  const showcaseProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 1.1,
  });
  // Never fully flat: the tilt settles at 3.5°, so the panel keeps
  // reading as a physical object floating in 3D space after the
  // scroll animation completes.
  const rotateX = useTransform(showcaseProgress, [0, 1], [17, 3.5]);
  const scale = useTransform(showcaseProgress, [0, 1], [0.93, 1]);
  const shotY = useTransform(showcaseProgress, [0, 1], [100, 0]);
  // As the panel straightens, its shadow softens, spreads, and blurs —
  // the object lifting further off the page.
  const shotShadow = useTransform(
    showcaseProgress,
    [0, 1],
    ["0 24px 48px rgba(0, 0, 0, 0.55)", "0 60px 120px rgba(0, 0, 0, 0.45)"]
  );

  useEffect(() => {
    fetchLatestGithubVersion().then((tag) => {
      if (tag) {
        setLatestTag(tag);
      }
    });
  }, []);

  return (
    <main className="overflow-visible bg-background">
      {/* ── Hero — GridScan holographic backdrop ── */}
      <section className="relative flex min-h-[88svh] flex-col justify-center">
        <HeroBackdrop />

        <div className="relative z-10 w-full pt-24 pb-20 md:pt-28">
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
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
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

              {/* Headline — per-word blur reveal, shimmer sweep on the payoff word.
                  Deliberately one size class down from a typical hero — the
                  content, not the type, should carry the section. */}
              <div className="mx-auto mt-10 max-w-3xl text-balance font-display text-[2.75rem] leading-[1.08] tracking-tight max-md:font-semibold md:text-[3.75rem] lg:mt-12 lg:text-7xl xl:text-[5rem]">
                {/* First word */}
                <span>{HEADLINE[0]}</span> {/* Shiny AI word */}
                <ShinyText
                  className="inline-block"
                  speed={0.8}
                  text={HEADLINE[1]!}
                />
                {/* Remaining words before highlight */}
                <span>{` ${HEADLINE[2]}`}</span>
                <br />
                <span>{HEADLINE[HEADLINE_HIGHLIGHT_FROM]}</span>
              </div>

              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground leading-relaxed"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                transition={{ duration: 0.6, delay: 0.65, ease: easeOut }}
              >
                {SUBHEAD}
              </motion.p>

              {/* Feature pills — quiet glass chips in place of CTA buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
                {FEATURE_PILLS.map((pill, i) => (
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    className="group/pill inline-flex cursor-default items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-muted-foreground text-xs backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground hover:shadow-[0_0_20px_-6px] hover:shadow-primary/25"
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    key={pill.label}
                    transition={{
                      duration: 0.45,
                      delay: 0.8 + i * 0.07,
                      ease: easeOut,
                    }}
                  >
                    <pill.icon className="size-3.5 transition-colors duration-200 group-hover/pill:text-primary" />
                    {pill.label}
                  </motion.span>
                ))}
              </div>

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
        </div>
      </section>

      {/* ── Screenshot — spring-eased 3D showcase that never goes flat ── */}
      <section className="relative">
        <Reveal direction="up" duration={500} offset={0}>
          {/* The parent owns the 3D scene: deep perspective, with
              preserve-3d carried down so the tilt renders inside it. */}
          <div
            className="mask-b-from-55% relative -mt-10 -mr-56 overflow-hidden px-2 pb-12 [perspective:2400px] sm:mr-0"
            ref={shotRef}
          >
            {/* Suspended-object bob (±3px) on its own element so it
                composes with the scroll transforms below. */}
            <div className="landing-hover-bob [transform-style:preserve-3d]">
              <motion.div
                className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/[0.07] bg-card/40 p-4 will-change-transform [transform-style:preserve-3d]"
                style={{ rotateX, scale, y: shotY, boxShadow: shotShadow }}
              >
                {/* light catching the upper edge */}
                <div
                  aria-hidden={true}
                  className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
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
          </div>
        </Reveal>
      </section>

      {/* ── Capability ticker ── */}
      <section className="py-5">
        <Marquee speed={38}>
          {CAPABILITIES.map((cap) => (
            <span
              className="mx-4 flex items-center gap-8 whitespace-nowrap text-muted-foreground/70 text-xs uppercase tracking-[0.25em]"
              key={cap}
            >
              {cap}
              <span
                aria-hidden={true}
                className="size-1 rounded-full bg-primary/50"
              />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <HeroStatCard
              description={stat.description}
              index={i}
              key={stat.label}
              label={stat.label}
              suffix={stat.suffix}
              value={stat.value}
            />
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
        <MagicBentoGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => {
            // Bento mosaic (lg+ only): first tile is the large hero cell,
            // the last spans wide beneath it; the two in between stay
            // standard size. Below lg everything stacks as a plain grid.
            const isHero = i === 0;
            const isWide = i === FEATURES.length - 1;
            return (
              <Reveal
                className={cn(
                  isHero && "lg:col-span-2 lg:row-span-2",
                  isWide && "lg:col-span-2"
                )}
                direction="up"
                duration={280}
                index={i}
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
                      {WORKSPACE_TILES.map((tile) => (
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
                  <Link
                    className="group/link mt-auto inline-flex items-center gap-1 pt-4 text-primary text-sm"
                    href={feature.href}
                  >
                    Explore
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                  </Link>
                </MagicBentoCard>
              </Reveal>
            );
          })}
        </MagicBentoGrid>
      </section>

      {/* ── Swarm section ── */}
      <section className="landing-band-fade bg-card/20">
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
            <Reveal
              direction="up"
              duration={240}
              index={SWARM_CHECKLIST.length}
            >
              <CtaLink
                className="group mt-8 h-10 px-5"
                href="/features"
                variant="ghost"
              >
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
        <div className="mx-auto mt-10 max-w-[1000px]">
          <Terminal
            lines={TERMINAL_LINES}
            shell="zsh"
            title="hyperion — swarm"
            typing={true}
          />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-6 pb-20 md:pb-28">
        <Reveal direction="up" duration={350} offset={36}>
          <GlowCard
            beam={true}
            className="p-10 text-center md:p-16"
            tilt={false}
          >
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
