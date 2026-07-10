"use client";

import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge, Eyebrow } from "../components/marketing-kit";

const entries = [
  {
    slug: "v0-1-0-terminal-multiplexer",
    title: "v0.1.0 — Terminal Multiplexer + Agent Dispatch",
    excerpt:
      "The first public release brings a 16-pane terminal grid, AI agent task dispatch from the Kanban board, and the canvas overlay for execution traces.",
    date: "July 1, 2026",
    tags: ["Release", "Core"],
  },
  {
    slug: "dependency-resolution-engine",
    title: "Dependency resolution engine — architecture deep dive",
    excerpt:
      "How Hyperion's agent dependency resolution works: chaining outputs, avoiding deadlocks, and managing shared state across autonomous agents.",
    date: "June 22, 2026",
    tags: ["Engineering"],
  },
  {
    slug: "theme-engine-40-oklch-themes",
    title: "Theme Engine: 40+ OKLCh themes shipped",
    excerpt:
      "Every theme in Hyperion uses OKLCh color space for perceptual uniformity across light, dark, and high-contrast modes. Here's how we built it.",
    date: "June 10, 2026",
    tags: ["Engineering", "Design"],
  },
  {
    slug: "canvas-overlay-agent-traces",
    title: "Canvas overlay — seeing your agents think",
    excerpt:
      "The canvas overlay renders agent execution traces as live topology graphs. Watch your agents navigate dependencies, open files, and resolve tasks in real-time.",
    date: "May 28, 2026",
    tags: ["Feature"],
  },
  {
    slug: "building-with-dnd-kit",
    title: "Building the task board: @dnd-kit deep dive",
    excerpt:
      "Why we chose @dnd-kit for our Kanban board, how drag-to-dispatch works, and the accessibility patterns we used for keyboard-first task management.",
    date: "May 15, 2026",
    tags: ["Engineering"],
  },
  {
    slug: "why-hyperion",
    title: "Why Hyperion? Rethinking the dev workspace for the AI era",
    excerpt:
      "Terminals, editors, and task boards were built for a world without AI agents. Hyperion is a ground-up rethink — here's why that matters.",
    date: "April 28, 2026",
    tags: ["Announcement"],
  },
];

export default function NewsPage() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 pt-36 pb-24 md:pb-32">
      <div
        aria-hidden={true}
        className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[420px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent)_0%,transparent_70%)] landing-glow-breathe"
      />
      <Eyebrow>Dev log</Eyebrow>
      <h1 className="mt-3 font-display text-4xl text-foreground tracking-tighter md:text-6xl">
        Notes from the build.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Release notes, engineering deep dives, and product updates from the
        Hyperion team.
      </p>

      <div className="mt-14 space-y-4">
        {entries.map((entry, i) => (
          <Reveal direction="up" duration={280} index={i} key={entry.slug}>
            <Link
              className="group block rounded-2xl border border-border bg-card/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-black/40 hover:shadow-lg md:p-8"
              href={`/news/${entry.slug}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                <span className="ml-auto text-muted-foreground text-xs">
                  {entry.date}
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl text-foreground tracking-tight transition-colors duration-200 group-hover:text-primary">
                  {entry.title}
                </h2>
                <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed md:text-base">
                {entry.excerpt}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
