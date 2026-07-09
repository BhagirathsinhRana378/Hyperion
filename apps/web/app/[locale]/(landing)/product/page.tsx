"use client";

import { Marquee, Counter, ProgressLine, staggerContainer, revealVariants } from "../components/motion-primitives";
import { GradientBand } from "../components/gradient-band";
import { CornerBrackets } from "../components/motion-primitives";
import { motion } from "motion/react";
import { Layout, Columns3, Palette, Keyboard, GitBranch, Box } from "lucide-react";
import Link from "next/link";

const taglines: string[] = [
  "Agentic workspace  ·  AI-native IDE  ·  Multi-pane terminal  ·  Visual canvas  ·  40+ themes  ·  ",
];

const features = [
  {
    icon: Layout,
    title: "Workspace System",
    description:
      "A unified interface combining multi-pane terminals, code editor, file browser, and canvas overlay — all in one window. Organize your tools the way you think.",
    gradient: "from-mistral-sunshine-700 to-mistral-sunshine-900",
  },
  {
    icon: Columns3,
    title: "Task Board",
    description:
      "Drag-and-drop Kanban board powered by @dnd-kit. Create tasks, assign them to AI agents, and watch them resolve in real-time through the terminal grid.",
    gradient: "from-mistral-primary to-mistral-primary-deep",
  },
  {
    icon: Box,
    title: "Canvas Overlay",
    description:
      "A real-time visual layer showing agent execution traces, dependency graphs, and system topology. Watch your agents think as they work.",
    gradient: "from-mistral-sunshine-700 to-mistral-primary",
  },
  {
    icon: Palette,
    title: "Theme Engine",
    description:
      "40+ OKLCh-based themes that adapt to your environment — light, dark, high-contrast, and every shade in between. Zero-config color harmony.",
    gradient: "from-mistral-sunshine-900 to-mistral-sunshine-500",
  },
  {
    icon: Keyboard,
    title: "Command Palette",
    description:
      "⌘+K opens a command palette for everything — dispatch agents, run terminal commands, switch themes, navigate files. Keyboard-first by design.",
    gradient: "from-mistral-primary-deep to-mistral-sunshine-700",
  },
  {
    icon: GitBranch,
    title: "Agent Swarm Pipeline",
    description:
      "Chain multiple agents into pipelines. One agent writes code, another tests it, a third deploys — all coordinated through the task board with full traceability.",
    gradient: "from-mistral-primary to-mistral-sunshine-900",
  },
];

export default function ProductPage() {
  return (
    <>
      {/* Sticky Parallax Hero */}
      <section className="relative isolate overflow-hidden">
        {/* Background gradient — TODO: replace with looping background video */}
        <div className="sticky top-16 -z-10 h-[80vh] w-full">
          <div
            aria-hidden={true}
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #ffa110 0%, #ff8a00 60%, #fa520f 20%)",
            }}
          />
          <div
            aria-hidden={true}
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-mistral-canvas"
          />
        </div>

        {/* Parallax content */}
        <div className="relative mx-auto max-w-7xl px-6 pb-section-lg" style={{ marginTop: "-60vh" }}>
          <div className="max-w-2xl pt-16">
            <span className="text-micro-uppercase text-mistral-ink/60">
              Hyperion Workspace
            </span>
            <h1 className="mt-2 font-display text-5xl leading-tight text-mistral-ink md:text-6xl lg:text-hero lg:leading-[1.05] lg:tracking-[-1.5px]">
              The agentic dev workspace.
            </h1>
            <p className="mt-6 text-subtitle text-mistral-ink-tint">
              Terminals, agents, code, and canvas — unified in one
              keyboard-first environment. Built for the age of autonomous
              software development.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="relative">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-mistral-ink px-5 text-button-md text-mistral-on-dark transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  href="/contact"
                >
                  Get early access
                </Link>
                <CornerBrackets
                  className="pointer-events-none absolute inset-0"
                  color="#1f1f1f"
                  size={12}
                  strokeWidth={2}
                />
              </div>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-mistral-hairline-strong bg-mistral-canvas/80 px-5 text-button-md text-mistral-ink backdrop-blur-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                href="/coding"
              >
                Explore terminal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee ticker */}
      <section className="border-y border-mistral-hairline-soft py-4">
        <Marquee speed={45} pauseOnHover={false}>
          <div className="flex items-center gap-8 px-4">
            {taglines[0]?.split("·").map((item, i) => (
              <span
                className="text-body-sm-medium text-mistral-stone whitespace-nowrap"
                key={i}
              >
                {item.trim()}
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      {/* Stat counters */}
      <section className="mx-auto max-w-7xl px-6 py-section-lg">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { target: 16, suffix: "+", label: "Tiled terminals" },
            { target: 40, suffix: "+", label: "OKLCh themes" },
            { target: 0, suffix: "ms", label: "Cold start" },
            { target: 100, suffix: "%", label: "Open source" },
          ].map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-display text-stat-display text-mistral-ink">
                <Counter target={stat.target} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-body-sm text-mistral-slate">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Progress line */}
      <ProgressLine trackClass="mx-auto max-w-7xl" />

      {/* Feature grid — staggered reveal */}
      <section className="mx-auto max-w-7xl px-6 py-section-lg">
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={revealVariants}
                className="group relative overflow-hidden rounded-xl border border-mistral-hairline-soft bg-mistral-canvas p-8 transition-all duration-200 hover:shadow-mistral-level-2"
              >
                {/* Top gradient accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} origin-left transition-transform duration-300`}
                />
                <Icon className="size-8 text-mistral-primary" />
                <h3 className="mt-4 text-heading-4 text-mistral-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-body-sm text-mistral-steel leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Product timeline */}
      <section className="bg-mistral-surface-cream-soft py-section-lg">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center font-display text-heading-1 text-mistral-ink">
            Product timeline
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-subtitle text-mistral-slate">
            From terminal multiplexer to full agentic workspace — the journey so
            far.
          </p>

          <div className="relative mt-16 space-y-16">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-mistral-hairline md:left-1/2 md:-translate-x-px" />

            {[
              { year: "Q1 2025", title: "Multi-pane terminal", desc: "16-pane xterm.js terminal grid with drag-and-drop layout engine." },
              { year: "Q2 2025", title: "Kanban task board", desc: "@dnd-kit powered board with drag-to-dispatch agent integration." },
              { year: "Q3 2025", title: "AI agent swarm", desc: "Autonomous agent dispatch, dependency resolution, and pipeline chaining." },
              { year: "Q4 2025", title: "Canvas overlay", desc: "Real-time agent execution traces and system topology visualization." },
              { year: "2026+", title: "Community & ecosystem", desc: "Plugin system, custom agent runtimes, and collaborative workspaces." },
            ].map((item, i) => (
              <div
                className={`relative flex flex-col gap-4 md:flex-row md:items-start ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                key={item.year}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 z-10 size-4 -translate-x-1/2 rounded-full border-2 border-mistral-primary bg-mistral-canvas md:left-1/2" />
                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <span className="text-micro-uppercase text-mistral-primary">{item.year}</span>
                  <h3 className="mt-1 text-heading-4 text-mistral-ink">{item.title}</h3>
                  <p className="mt-1 text-body-sm text-mistral-steel">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient band */}
      <GradientBand variant="full" />
    </>
  );
}
