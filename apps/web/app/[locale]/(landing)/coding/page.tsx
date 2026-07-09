"use client";

import { Marquee, Counter, StickyPanels } from "../components/motion-primitives";
import { GradientBand } from "../components/gradient-band";
import { CodeBlock } from "@workspace/ui/components/marketing/code-block";
import { Terminal, Cpu, Network, Layout } from "lucide-react";
import Link from "next/link";

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
> agent: task complete ✓ (12.4s)`; // TODO: replace with real asset

export default function CodingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-section-lg">
        <div
          aria-hidden={true}
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, #ffa110 0%, #ff8a00 60%, #fa520f 20%)",
          }}
        />
        <div
          aria-hidden={true}
          className="absolute inset-0 -z-10 bg-gradient-to-r from-white/40 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-micro-uppercase text-mistral-ink/60">
                Terminal Multiplexer
              </span>
              <h1 className="mt-2 font-display text-5xl leading-tight text-mistral-ink md:text-6xl lg:text-hero lg:leading-[1.05] lg:tracking-[-1.5px]">
                The terminal, reimagined.
              </h1>
              <p className="mt-6 max-w-xl text-subtitle text-mistral-ink-tint">
                A multi-pane terminal multiplexer with autonomous AI agent
                dispatch. Your dev environment, supercharged.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-mistral-ink px-5 text-button-md text-mistral-on-dark transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  href="/contact"
                >
                  Get early access
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-mistral-hairline-strong bg-mistral-canvas/80 px-5 text-button-md text-mistral-ink backdrop-blur-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  href="/docs"
                >
                  Read the docs
                </Link>
              </div>
            </div>
            {/* Terminal mockup placeholder */}
            <CodeBlock
              className="shadow-mistral-level-3"
              code={codeSample}
              header="agent-dispatch.log"
              language="shell"
            />
          </div>
        </div>
      </section>

      {/* Marquee tech stack ticker */}
      <section className="border-y border-mistral-hairline-soft py-4">
        <Marquee speed={50} pauseOnHover={false}>
          <div className="flex items-center gap-8 px-4">
            {techStack[0]?.split("·").map((item, i) => (
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

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-section-lg">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <p className="font-display text-stat-display text-mistral-ink">
              <Counter target={16} suffix="" /> <span className="text-heading-2">+</span>
            </p>
            <p className="mt-2 text-body-sm text-mistral-slate">
              Tiled terminal panes
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="font-display text-stat-display text-mistral-ink">
              <Counter target={0} suffix="" /> <span className="text-heading-2">ms</span>
            </p>
            <p className="mt-2 text-body-sm text-mistral-slate">
              Zero-config setup time
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="font-display text-stat-display text-mistral-ink">
              <Counter target={100} suffix="%" />
            </p>
            <p className="mt-2 text-body-sm text-mistral-slate">
              Open source
            </p>
          </div>
        </div>
      </section>

      {/* Sticky-panel feature walkthrough */}
      <section className="pb-section-lg">
        <StickyPanels panels={features} />
      </section>

      {/* Gradient band */}
      <GradientBand variant="full" />
    </>
  );
}
