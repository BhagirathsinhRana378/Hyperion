"use client";

import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { DocsBackdrop } from "../components/docs-backdrop";
import { DocsSidebar } from "../components/docs-sidebar";
import {
  Callout,
  CodeBlock,
  CommandBar,
  CopyButton,
  FAQ,
} from "../components/marketing-kit";

/* ── Section registry — drives the sidebar and scroll-spy ──── */

const sections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "installation", label: "Installation" },
  { id: "quick-start", label: "Quick Start" },
  { id: "cli", label: "CLI" },
  { id: "commands", label: "Commands" },
  { id: "configuration", label: "Configuration" },
  { id: "agents", label: "Agents" },
  { id: "workspaces", label: "Workspaces" },
  { id: "task-board", label: "Task Board" },
  { id: "api", label: "API" },
  { id: "examples", label: "Examples" },
  { id: "faq", label: "FAQ" },
];

const QUICK_START_CODE = `$ hyperion init
✓ workspace created at ~/dev/my-app/.hyperion

$ hyperion swarm start --agents 3
✓ 3 agents attached · 3 terminals tiled

$ hyperion task add "migrate auth to sessions"
▸ planned into 4 sub-tasks · dispatched to swarm

agent-01 › planning    docs/auth-migration.md
agent-02 › coding      src/auth/session.ts
agent-03 › testing     31 passed, 0 failed

✓ task complete · PR #12 opened`;

const CONFIG_CODE = `// hyperion.config.ts
import { defineConfig } from "@hyperion/core";

export default defineConfig({
  agents: {
    max: 6,               // concurrent agents
    model: "claude-fable-5",
    memory: true,         // persist context across sessions
  },
  terminals: {
    grid: [4, 4],         // up to 16 panes
    shell: "zsh",
  },
  git: {
    worktrees: true,      // isolate each agent on its own worktree
    autoPr: true,         // open a PR when a task completes
  },
  board: {
    columns: ["Backlog", "In Progress", "Review", "Done"],
  },
});`;

const API_CODE = `import { Hyperion } from "@hyperion/sdk";

const hq = new Hyperion();

// Plan a goal into a dependency-aware task graph
const plan = await hq.plan("add rate limiting to the API");

// Dispatch it to the swarm and stream progress
const run = hq.dispatch(plan, { agents: 3 });

for await (const event of run.events()) {
  console.log(event.agent, event.status, event.file);
}

const pr = await run.result(); // → { url: "…/pull/219" }`;

const commandRows = [
  { cmd: "hyperion init", desc: "Create a workspace in the current repo" },
  {
    cmd: "hyperion swarm start",
    desc: "Attach agents and tile their terminals",
  },
  { cmd: "hyperion task add <goal>", desc: "Plan a goal and dispatch it" },
  { cmd: "hyperion agents ls", desc: "List agents with live status" },
  { cmd: "hyperion attach <agent>", desc: "Take over an agent's terminal" },
  { cmd: "hyperion board", desc: "Open the task board" },
  { cmd: "hyperion logs <task>", desc: "Stream a task's execution trace" },
  { cmd: "hyperion stop --all", desc: "Halt the swarm, keep the worktrees" },
];

const faqItems = [
  {
    question: "Does my code leave my machine?",
    answer:
      "No. Agents execute locally in your terminals and worktrees. Only the model calls you configure leave the machine — never your repository, unless you push it.",
  },
  {
    question: "Can I interrupt an agent mid-task?",
    answer:
      "Yes. Every agent works in a real terminal pane — attach to it, pause it, type into its shell, or reassign the task from the board at any point.",
  },
  {
    question: "How many agents can run at once?",
    answer:
      "The default cap is 6 concurrent agents, configurable in hyperion.config.ts. The terminal grid tiles up to 16 panes.",
  },
  {
    question: "Which models does Hyperion support?",
    answer:
      "Any provider with an OpenAI-compatible or Anthropic API. Set the model per-workspace or per-agent in the configuration file.",
  },
];

/* ── Local primitives ──────────────────────────────────────── */

/** Minimal pill tabs — used for per-package-manager installs. */
function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div data-slot="docs-tabs">
      <div className="flex w-fit gap-1 rounded-full border border-border/60 bg-card/50 p-1">
        {tabs.map((tab, i) => (
          <button
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1 text-xs transition-colors duration-200",
              i === active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            )}
            key={tab.label}
            onClick={() => setActive(i)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[active]?.content}</div>
    </div>
  );
}

/** Doc section shell — anchor target + consistent rhythm. */
function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-36" id={id}>
      <Reveal direction="up" duration={260} offset={20}>
        <h2 className="font-display font-semibold text-2xl text-foreground tracking-tight">
          {title}
        </h2>
        <div className="mt-4 space-y-4 text-muted-foreground text-sm leading-relaxed [&_strong]:text-foreground/90">
          {children}
        </div>
      </Reveal>
    </section>
  );
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: highlight the sidebar entry whose section is in view.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            window.history.replaceState(null, "", `#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    for (const s of sections) {
      const el = root.querySelector(`#${s.id}`);
      if (el) {
        observer.observe(el);
      }
    }
    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section if URL hash is present on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, []);

  const jumpTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `#${id}`);
  };

  return (
    <div className="relative">
      {/* LineWaves — warped platinum contours behind the hero band */}
      <DocsBackdrop />

      {/* Hero */}
      <section className="relative z-10 pt-36 pb-10">
        <div className="mx-auto max-w-7xl px-6">
          {/* <Eyebrow>Documentation</Eyebrow> */}
          {/* <h1 className="mt-3 font-display text-4xl text-foreground tracking-tighter md:text-6xl">
            Learn Hyperion.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            From first install to a running agent swarm — everything you need,
            on one page.
          </p> */}
        </div>
      </section>

      <div className="relative z-10 mx-auto mt-0 flex max-w-7xl gap-12 px-15 pb-24 md:pb-32">
        <DocsSidebar
          activeId={activeId}
          onSectionClick={jumpTo}
          sections={sections}
        />

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-16" ref={contentRef}>
          <DocSection id="getting-started" title="Getting Started">
            <p>
              Hyperion is an <strong>agentic workspace</strong>: a terminal
              multiplexer, an AI agent swarm, and a live task board fused into
              one surface. You describe outcomes; agents plan, code, test, and
              ship them in parallel while you supervise.
            </p>
            <Callout variant="note">
              Hyperion runs entirely on your machine. A workspace lives inside
              your repository in a <code>.hyperion/</code> directory.
            </Callout>
          </DocSection>

          <DocSection id="installation" title="Installation">
            <p>Install the CLI with your package manager of choice:</p>
            <Tabs
              tabs={[
                {
                  label: "npm",
                  content: (
                    <CommandBar command="npm install -g @hyperion/cli" />
                  ),
                },
                {
                  label: "pnpm",
                  content: <CommandBar command="pnpm add -g @hyperion/cli" />,
                },
                {
                  label: "bun",
                  content: <CommandBar command="bun add -g @hyperion/cli" />,
                },
              ]}
            />
            <Callout variant="tip">
              Prefer the desktop app? Grab a signed build for Windows, macOS, or
              Linux on the download page — the CLI is bundled.
            </Callout>
          </DocSection>

          <DocSection id="quick-start" title="Quick Start">
            <p>
              Three commands take you from an empty repo to a working swarm:
            </p>
            <CodeBlock
              code={QUICK_START_CODE}
              header="quick start"
              language="shell"
              typing={true}
            />
          </DocSection>

          <DocSection id="cli" title="CLI">
            <p>
              The <code>hyperion</code> binary is the front door to everything —
              workspaces, agents, tasks, and the board all have first-class
              commands. Every command supports <code>--json</code> for
              scripting.
            </p>
            <CommandBar command="hyperion --help" />
          </DocSection>

          <DocSection id="commands" title="Commands">
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-border/60 border-b bg-card/60">
                    <th className="px-4 py-3 font-medium text-foreground/70">
                      Command
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground/70">
                      Description
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {commandRows.map((row) => (
                    <tr
                      className="border-border/40 border-b transition-colors duration-150 last:border-b-0 hover:bg-muted/30"
                      key={row.cmd}
                    >
                      <td className="px-4 py-3 font-mono text-foreground/90 text-xs">
                        {row.cmd}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.desc}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <CopyButton value={row.cmd} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>

          <DocSection id="configuration" title="Configuration">
            <p>
              Everything is configured from a single typed file at the workspace
              root:
            </p>
            <CodeBlock
              code={CONFIG_CODE}
              header="hyperion.config.ts"
              language="typescript"
            />
            <Callout variant="warning">
              Raising <code>agents.max</code> above your machine's core count
              will slow the swarm down, not speed it up — agents are CPU-bound
              while running your tests.
            </Callout>
          </DocSection>

          <DocSection id="agents" title="Agents">
            <p>
              An agent is a model, a terminal, and a git worktree bound
              together. Agents <strong>plan</strong> goals into task graphs,
              <strong> code</strong> against isolated branches,
              <strong> test</strong> their own output, and
              <strong> review</strong> each other's diffs before anything
              reaches you.
            </p>
            <p>
              Agent memory persists conventions and decisions across sessions,
              so the second week is faster than the first.
            </p>
          </DocSection>

          <DocSection id="workspaces" title="Workspaces">
            <p>
              A workspace tiles terminals, editors, previews, and the board into
              one adaptive canvas. Layouts are saved per-project and restore
              exactly — pane sizes, scroll positions, running shells.
            </p>
          </DocSection>

          <DocSection id="task-board" title="Task Board">
            <p>
              The kanban board is the swarm's source of truth. Cards move
              themselves as agents progress; drag a card onto an agent to
              dispatch it, or drag it back to Backlog to halt work.
            </p>
            <Callout variant="tip">
              Cards accept plain-language goals. "Make the settings page not
              feel slow" is a valid task — planning turns it into concrete
              sub-tasks.
            </Callout>
          </DocSection>

          <DocSection id="api" title="API">
            <p>
              Everything the CLI does is available programmatically through the
              SDK:
            </p>
            <CodeBlock
              code={API_CODE}
              header="swarm.ts"
              language="typescript"
            />
          </DocSection>

          <DocSection id="examples" title="Examples">
            <p>Common one-liners to steal:</p>
            <div className="flex flex-col items-start gap-3">
              <CommandBar
                command={'hyperion task add "upgrade to react 19" --agents 2'}
              />
              <CommandBar command="hyperion swarm start --agents 4 --model claude-fable-5" />
              <CommandBar command="hyperion logs 04 --follow" />
            </div>
          </DocSection>

          <DocSection id="faq" title="FAQ">
            <FAQ items={faqItems} />
          </DocSection>
        </div>
      </div>
    </div>
  );
}
