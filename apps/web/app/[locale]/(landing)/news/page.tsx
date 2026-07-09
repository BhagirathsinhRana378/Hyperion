"use client";

import { Badge } from "@workspace/ui/components/marketing/badge";
import { GradientBand } from "../components/gradient-band";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import Link from "next/link";

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
    <>
      <section className="mx-auto max-w-6xl px-6 pt-32 pb-section">
        <h1 className="font-display text-heading-1 text-mistral-ink">
          Dev log
        </h1>
        <p className="mt-4 max-w-2xl text-subtitle text-mistral-ink-tint">
          Release notes, engineering deep dives, and product updates from the
          Hyperion team.
        </p>

        <div className="mt-12 space-y-6">
          {entries.map((entry, i) => (
            <Reveal direction="up" duration={280} index={i} key={entry.slug}>
              <Link
                className="group block rounded-xl border border-mistral-hairline-soft bg-mistral-canvas p-6 transition-all duration-200 hover:shadow-mistral-level-2 md:p-8"
                href={`/news/${entry.slug}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="cream">{tag}</Badge>
                  ))}
                  <span className="text-caption text-mistral-stone ml-auto">
                    {entry.date}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-heading-3 text-mistral-ink transition-colors group-hover:text-mistral-primary">
                  {entry.title}
                </h2>
                <p className="mt-2 text-body-md text-mistral-slate leading-relaxed">
                  {entry.excerpt}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <GradientBand variant="full" />
    </>
  );
}
