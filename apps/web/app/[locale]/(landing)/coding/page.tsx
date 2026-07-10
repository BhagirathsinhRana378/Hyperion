"use client";

import { motion } from "motion/react";
import { Cpu, Layout, Network, Terminal } from "lucide-react";
import {
  Counter,
  Marquee,
  StickyPanels,
  revealVariants,
  staggerContainer,
} from "../components/motion-primitives";
import { CodeBlock, CtaLink, Eyebrow } from "../components/marketing-kit";

const techStack: string[] = [
  "No cables  ·  No plugins  ·  No setups  ·  Zero config  ·  16 panes  ·  Agent dispatch  ·  Dependency resolution  ·  Real-time sync  ·  Canvas overlay  ·  Monaco editor  ·  xterm.js  ·  node-pty  ·  WebSocket streaming  ·  Container-native  ·  Open source  ·  ",
];

const features = [
  {
    number: "01",
    title: "Multi-Pane Terminal Grid",
    description:
      "Up to 16 tiled terminal panes powered by xterm.js and node-pty. Each pane is an independent shell session — split, resize, reorder, and group them with drag-and-drop. Every pane can be assigned to a different container or host.",
    icon: Layout,
  },
  {
    number: "02",
    title: "AI Agent Dispatch",
    description:
      "Agents are dispatched from the Kanban task board. Drag a task card onto an agent pool and watch as the agent claims it, opens terminals, edits files, and reports back — all in real-time through the canvas overlay.",
    icon: Cpu,
  },
  {
    number: "03",
    title: "Dependency Resolution",
    description:
      "The resolution engine chains agent outputs, resolves inter-task dependencies, and manages shared state. If Agent A produces a file Agent B needs, the system waits, passes context, and continues — no deadlocks, no stale artifacts.",
    icon: Network,
  },
  {
    number: "04",
    title: "16-Pane Layout Engine",
    description:
      "Grid layouts scale from 1 to 16 panes with intelligent auto-tiling. Save layouts as presets, restore them per-project, and share them with your team. Supports split-view diffs, side-by-side terminal + editor, and floating inspectors.",
    icon: Terminal,
  },
];

const codeSample = `# Dispatch an agent task from the task board
hyperion task dispatch --board "sprint-27" --card "fix-auth-flow"

# Watch agent execution in real-time
hyperion watch --trace --canvas

# Agent opens terminals autonomously
> agent: opening terminal session [pane-03]
> agent: installing dependencies...
> agent: running tests...
> agent: task complete ✓ (12.4s)`;

export default function CodingPage() {
  return (
    <>
      {/* Hero — split layout, terminal front and center */}
      <section className="relative overflow-hidden pt-36 pb-20 md:pb-28">
        <div
          aria-hidden={true}
          className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[560px] [background:radial-gradient(50%_55%_at_30%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent)_0%,transparent_70%)] landing-glow-breathe"
        />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              animate="visible"
              initial="hidden"
              variants={staggerContainer}
            >
              <motion.div variants={revealVariants}>
                <Eyebrow>Terminal Multiplexer</Eyebrow>
              </motion.div>
              <motion.h1
                className="mt-3 font-display text-5xl text-foreground leading-[1.05] tracking-tighter md:text-6xl lg:text-7xl"
                variants={revealVariants}
              >
                The terminal, reimagined.
              </motion.h1>
              <motion.p
                className="mt-6 max-w-xl text-lg text-muted-foreground"
                variants={revealVariants}
              >
                A multi-pane terminal multiplexer with autonomous AI agent
                dispatch. Your dev environment, supercharged.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-wrap gap-3"
                variants={revealVariants}
              >
                <CtaLink href="/contact">Get early access</CtaLink>
                <CtaLink href="/docs" variant="ghost">
                  Read the docs
                </CtaLink>
              </motion.div>
            </motion.div>

            <CodeBlock
              code={codeSample}
              header="agent-dispatch.log"
              language="shell"
              typing={true}
            />
          </div>
        </div>
      </section>

      {/* Marquee tech stack ticker */}
      <section className="border-border border-y py-4">
        <Marquee className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" pauseOnHover={false} speed={50}>
          <div className="flex items-center gap-8 px-4">
            {techStack[0]?.split("·").map((item, i) => (
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

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { target: 16, unit: "+", label: "Tiled terminal panes" },
            { target: 0, unit: "ms", label: "Zero-config setup time" },
            { target: 100, unit: "%", label: "Open source" },
          ].map((stat) => (
            <div className="text-center sm:text-left" key={stat.label}>
              <p className="font-display text-5xl text-primary tracking-tight md:text-6xl">
                <Counter target={stat.target} />
                <span className="text-3xl text-primary/70">{stat.unit}</span>
              </p>
              <p className="mt-2 text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky-panel feature walkthrough */}
      <section className="border-border border-t bg-card/30 pb-20 md:pb-28">
        <StickyPanels panels={features} />
      </section>
    </>
  );
}
