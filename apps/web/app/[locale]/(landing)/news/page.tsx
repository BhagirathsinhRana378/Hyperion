"use client";

import { Reveal } from "@workspace/ui/components/marketing/reveal";
import {
  ArrowUpRight,
  Bot,
  GitBranch,
  Megaphone,
  Palette,
  SquareKanban,
  SquareTerminal,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Badge, CtaLink, Eyebrow } from "../components/marketing-kit";

const FloatingLines = dynamic(() => import("../components/FloatingLines"), {
  ssr: false,
});

const PAGE_SIZE = 4;

const entries = [
  {
    slug: "v0-1-0-terminal-multiplexer",
    title: "v0.1.0 — Terminal Multiplexer + Agent Dispatch",
    excerpt:
      "The first public release brings a 16-pane terminal grid, AI agent task dispatch from the Kanban board, and the canvas overlay for execution traces.",
    date: "July 1, 2026",
    tags: ["Release", "Core"],
    readTime: "6 min",
    icon: SquareTerminal,
  },
  {
    slug: "dependency-resolution-engine",
    title: "Dependency resolution engine — architecture deep dive",
    excerpt:
      "How Hyperion's agent dependency resolution works: chaining outputs, avoiding deadlocks, and managing shared state across autonomous agents.",
    date: "June 22, 2026",
    tags: ["Engineering"],
    readTime: "11 min",
    icon: GitBranch,
  },
  {
    slug: "theme-engine-40-oklch-themes",
    title: "Theme Engine: 40+ OKLCh themes shipped",
    excerpt:
      "Every theme in Hyperion uses OKLCh color space for perceptual uniformity across light, dark, and high-contrast modes. Here's how we built it.",
    date: "June 10, 2026",
    tags: ["Engineering", "Design"],
    readTime: "8 min",
    icon: Palette,
  },
  {
    slug: "canvas-overlay-agent-traces",
    title: "Canvas overlay — seeing your agents think",
    excerpt:
      "The canvas overlay renders agent execution traces as live topology graphs. Watch your agents navigate dependencies, open files, and resolve tasks in real-time.",
    date: "May 28, 2026",
    tags: ["Feature"],
    readTime: "5 min",
    icon: Bot,
  },
  {
    slug: "building-with-dnd-kit",
    title: "Building the task board: @dnd-kit deep dive",
    excerpt:
      "Why we chose @dnd-kit for our Kanban board, how drag-to-dispatch works, and the accessibility patterns we used for keyboard-first task management.",
    date: "May 15, 2026",
    tags: ["Engineering"],
    readTime: "9 min",
    icon: SquareKanban,
  },
  {
    slug: "why-hyperion",
    title: "Why Hyperion? Rethinking the dev workspace for the AI era",
    excerpt:
      "Terminals, editors, and task boards were built for a world without AI agents. Hyperion is a ground-up rethink — here's why that matters.",
    date: "April 28, 2026",
    tags: ["Announcement"],
    readTime: "7 min",
    icon: Megaphone,
  },
];

export default function NewsPage() {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = entries.slice(0, visible);
  const hasMore = visible < entries.length;

  return (
    <div className="relative">
      <div
        aria-hidden={true}
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[550px] w-full overflow-hidden"
      >
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={7}
          lineDistance={9}
          bendRadius={5.0}
          bendStrength={-8.5}
          interactive={true}
          parallax={true}
          linesGradient={["#e8e8e8", "#6f6f6f", "#6a6a6a"]}
        />
        {/* Soft wash to blend it in */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>
      <section className="relative mx-auto max-w-4xl px-6 pt-36 pb-24 md:pb-32">
      <h1 className="mt-3 font-display text-4xl text-foreground tracking-tighter md:text-6xl">
        Notes from the build.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Release notes, engineering deep dives, and product updates from the
        Hyperion team.
      </p>

      <div className="mt-14 space-y-5">
        {shown.map((entry, i) => (
          <Reveal
            direction="up"
            duration={280}
            index={i % PAGE_SIZE}
            key={entry.slug}
          >
            <Link
              className="group flex flex-col gap-6 overflow-hidden rounded-2xl border border-border bg-card/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-black/40 hover:shadow-lg sm:flex-row md:p-7"
              href={`/news/${entry.slug}`}
            >
              {/* Image placeholder — monochrome glyph tile */}
              <div className="relative flex h-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-secondary via-card to-background sm:h-auto sm:w-44">
                <div
                  aria-hidden={true}
                  className="absolute inset-0 opacity-40 [background-size:20px_20px] [background:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)]"
                />
                <entry.icon className="relative size-9 text-muted-foreground transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110 group-hover:text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                  <span className="ml-auto text-muted-foreground text-xs">
                    {entry.date} · {entry.readTime} read
                  </span>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <h2 className="font-display text-foreground text-xl tracking-tight transition-colors duration-200 group-hover:text-primary md:text-2xl">
                    {entry.title}
                  </h2>
                  <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {entry.excerpt}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <CtaLink
            className="h-10 cursor-pointer px-6"
            onClick={(e) => {
              e.preventDefault();
              setVisible((v) => v + PAGE_SIZE);
            }}
            variant="ghost"
          >
            Load more
          </CtaLink>
        </div>
      )}
    </section>
    </div>
  );
}
