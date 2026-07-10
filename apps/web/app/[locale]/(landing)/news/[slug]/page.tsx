"use client";

import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge, CtaLink } from "../../components/marketing-kit";

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
    <article className="relative mx-auto max-w-3xl px-6 pt-36 pb-24">
      <div
        aria-hidden={true}
        className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[360px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_8%,transparent)_0%,transparent_70%)] landing-glow-breathe"
      />
      <Link
        className="group mb-8 inline-flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
        href="/news"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to dev log
      </Link>

      <Reveal direction="up" duration={280}>
        <div className="flex flex-wrap items-center gap-2">
          {entry.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Calendar className="size-3.5" />
            {entry.date}
          </span>
        </div>

        <h1 className="mt-4 font-display text-4xl text-foreground tracking-tighter md:text-5xl">
          {entry.title}
        </h1>
      </Reveal>

      <Reveal direction="up" delay={100} duration={300}>
      <div className="mt-10 space-y-6">
        {entry.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <h2
                className="mt-10 mb-4 font-display text-3xl text-foreground tracking-tight"
                key={i}
              >
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 className="mt-8 mb-3 font-medium text-foreground text-xl" key={i}>
                {line.slice(4)}
              </h3>
            );
          }
          if (line.startsWith("- **")) {
            const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
            if (match) {
              return (
                <li className="ml-6 list-disc text-muted-foreground" key={i}>
                  <strong className="text-foreground">{match[1]}</strong>:{match[2]}
                </li>
              );
            }
          }
          if (line.startsWith("- ")) {
            return (
              <li className="ml-6 list-disc text-muted-foreground" key={i}>
                {line.slice(2)}
              </li>
            );
          }
          if (line.trim() === "") {
            return <br key={i} />;
          }
          return (
            <p className="text-muted-foreground leading-relaxed" key={i}>
              {line}
            </p>
          );
        })}
      </div>
      </Reveal>

      {/* Closing CTA */}
      <Reveal direction="up" duration={300}>
        <div className="relative mt-16 overflow-hidden rounded-2xl border border-border bg-card/40 px-8 py-12 text-center">
          <div
            aria-hidden={true}
            className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_80%_at_50%_100%,color-mix(in_oklab,var(--color-primary)_10%,transparent)_0%,transparent_70%)]"
          />
          <div className="relative">
            <h2 className="font-display text-3xl text-foreground tracking-tight">
              Try Hyperion
            </h2>
            <p className="mt-2 text-muted-foreground">
              Get early access to the agentic dev workspace.
            </p>
            <div className="mt-6 inline-flex">
              <CtaLink href="/contact">Request access</CtaLink>
            </div>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
