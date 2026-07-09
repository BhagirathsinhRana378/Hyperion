"use client";

import { Badge } from "@workspace/ui/components/marketing/badge";
import { GradientBand } from "../../components/gradient-band";
import { CornerBrackets } from "../../components/motion-primitives";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const entry = {
    title: "v0.1.0 — Terminal Multiplexer + Agent Dispatch",
    date: "July 1, 2026",
    tags: ["Release", "Core"],
    content: `## What's new

This is the first public release of Hyperion — an agentic workspace environment for autonomous software development.

### Terminal Multiplexer

The centerpiece of this release is a 16-pane terminal grid built on xterm.js and node-pty. Each pane is an independent shell session.

Key features:
- Up to 16 tiled panes per workspace
- Drag-and-drop pane reordering
- Layout presets that persist per project
- Floating inspectors for long-running processes

### AI Agent Dispatch

Agents are dispatched from the Kanban task board. Drag a task card onto an agent pool and the agent claims it, opens terminals, edits files, and reports back.

### Canvas Overlay

A real-time visual layer showing agent execution traces. Watch your agents navigate dependencies, open files, and resolve tasks as they happen.

## What's next

The next release will focus on the dependency resolution engine — chaining multiple agents into pipelines where one agent's output feeds another's input.`,
  };

  return (
    <article className="mx-auto max-w-3xl px-6 pt-32 pb-section">
      <Link
        className="mb-8 inline-flex items-center gap-2 text-body-sm-medium text-mistral-primary transition-colors hover:text-mistral-primary-deep"
        href="/news"
      >
        <ArrowLeft className="size-4" />
        Back to dev log
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {entry.tags.map((tag) => (
          <Badge key={tag} variant="cream">{tag}</Badge>
        ))}
        <span className="flex items-center gap-1 text-caption text-mistral-stone">
          <Calendar className="size-3.5" />
          {entry.date}
        </span>
      </div>

      <h1 className="mt-4 font-display text-heading-1 text-mistral-ink">
        {entry.title}
      </h1>

      <div className="mt-10 space-y-6">
        {entry.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <h2 className="mt-10 mb-4 font-display text-heading-2 text-mistral-ink" key={i}>
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 className="mt-8 mb-3 text-heading-3 text-mistral-ink" key={i}>
                {line.slice(4)}
              </h3>
            );
          }
          if (line.startsWith("- **")) {
            const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
            if (match) {
              return (
                <li className="text-body-md text-mistral-slate ml-6 list-disc" key={i}>
                  <strong className="text-mistral-ink">{match[1]}</strong>:{match[2]}
                </li>
              );
            }
          }
          if (line.startsWith("- ")) {
            return (
              <li className="text-body-md text-mistral-slate ml-6 list-disc" key={i}>
                {line.slice(2)}
              </li>
            );
          }
          if (line.trim() === "") {
            return <br key={i} />;
          }
          return (
            <p className="text-body-md text-mistral-slate leading-relaxed" key={i}>
              {line}
            </p>
          );
        })}
      </div>

      <div className="relative mt-16 rounded-xl bg-mistral-cream px-8 py-12 text-center">
        <h2 className="font-display text-heading-2 text-mistral-ink">
          Try Hyperion
        </h2>
        <p className="mt-2 text-body-md text-mistral-slate">
          Get early access to the agentic dev workspace.
        </p>
        <div className="relative mt-6 inline-flex">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-mistral-ink px-5 text-button-md text-mistral-on-dark transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            href="/contact"
          >
            Request access
          </Link>
          <CornerBrackets
            className="pointer-events-none absolute inset-0"
            color="#1f1f1f"
            size={10}
            strokeWidth={2}
          />
        </div>
      </div>

      <div className="mt-12">
        <GradientBand variant="full" />
      </div>
    </article>
  );
}
