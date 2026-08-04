<div align="center">

<img src="https://img.shields.io/badge/-🪐-6366f1?style=for-the-badge" alt="Hyperion" />

# Hyperion

**The agentic workspace for orchestrating parallel AI coding agents.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131.svg?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000.svg?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Discord](https://img.shields.io/badge/Discord-Join%20us-5865F2.svg?style=flat-square&logo=discord&logoColor=white)](#community)

[Website](#) · [Documentation](#) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>

---

## Table of Contents

- [About](#about)
- [Why Hyperion](#why-hyperion)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Open Source vs. Hosted](#open-source-vs-hosted)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Community](#community)
- [Security](#security)
- [License](#license)

---

## About

Hyperion is a cross-platform workspace environment for developers who run multiple AI coding agents at once. Instead of juggling terminals, browser tabs, and scattered notes, Hyperion gives every project its own isolated workspace — with scoped terminals, a live agent grid, a kanban task board, and a versioned prompt library, all in one place.

The **application** — the desktop and web client you run locally — is fully open source and lives in this repository. Our hosted dashboard and website are closed-source and maintained separately (see [Open Source vs. Hosted](#open-source-vs-hosted)).

## Why Hyperion

Developers using AI coding agents today are stuck in a loop:

```
Open terminal → run agent → switch to browser → check output
   → open notes → find prompt → copy prompt → switch back
   → paste prompt → agent fails → open terminal → debug → repeat
```

Hyperion collapses that loop into a single view.

| Without Hyperion | With Hyperion |
|---|---|
| A dozen scattered terminal windows | One scoped terminal grid per project |
| Prompts copy-pasted from notes apps | A versioned prompt library |
| Manual tracking of what agents did | A kanban board wired to agent dispatch |
| Five different tools, five contexts | One workspace, one view |
| One project in focus at a time | A sidebar of isolated workspaces |

## Features

### Multi-Workspace System
Every project gets its own self-contained environment. Switching workspaces swaps the terminal grid, agent pool, task board, and prompt library instantly — with zero cross-contamination between projects.

### Agent Grid
Run multiple AI coding agents in parallel, each in its own terminal pane, with real-time output streaming and the ability to stop, restart, or reassign agents on the fly.

### Terminal Multiplexer
Tiled, resizable terminal panes scoped to the active workspace's project directory. Split horizontally or vertically, and switch between tabs without losing context.

### Task Board (Kanban)
Create and assign tasks, then drag one onto an agent to start it working. Status updates flow back to the board in real time as agents run.

### Prompt Forge
Version-controlled prompt templates, scoped per workspace. Iterate on a prompt, compare versions, and attach the one that works to a task or agent.

### Agent Swarm
Define dependencies between tasks and let Hyperion coordinate execution order — sequential where it must be, parallel where it can be.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      HYPERION SHELL                       │
│              (Tauri 2 Desktop · Next.js Web)               │
├───────────┬──────────────────────────────────────────────┤
│           │                                                │
│  SIDEBAR  │                WORKSPACE VIEW                 │
│           │                                                │
│ Workspace │   ┌──────────────┬──────────────┐             │
│   List    │   │ Terminal-1   │ Terminal-2   │             │
│           │   ├──────────────┼──────────────┤             │
│  + New    │   │  Agent-1     │  Agent-2     │             │
│           │   └──────────────┴──────────────┘             │
│           │   ┌──────────────────────────────┐            │
│           │   │        Task Board             │            │
│           │   ├──────────────────────────────┤            │
│           │   │        Prompt Forge            │            │
│           │   └──────────────────────────────┘            │
├───────────┴──────────────────────────────────────────────┤
│                      BACKEND LAYER                         │
│  Workspace Manager · Agent Spawner · Task Scheduler         │
│  PTY Pool · WebSocket Server · SQLite (persistence)          │
└──────────────────────────────────────────────────────────┘
```

**Data flow, in short:**

- Creating a workspace allocates an isolated scope; the sidebar and view update immediately.
- Spawning an agent on a task launches a process, allocates a PTY, and streams output over WebSocket to both the terminal and the board.
- Switching workspaces swaps the active scope — terminals, agents, and tasks all reload for the newly selected project.

## Project Structure

```
apps/
  web/                    Next.js (SSR) — web app + PWA
  native/                 Tauri 2 — desktop & mobile

packages/
  core/                   Shared logic
  ├── pages/
  │   ├── workspace-page.tsx        Main IDE layout
  │   ├── terminal-page.tsx         Terminal grid
  │   └── kanban-page.tsx           Task board
  ├── components/
  │   ├── terminal/                 xterm.js wrapper + grid
  │   ├── agents/                   Agent panel + swarm
  │   ├── kanban/                   Drag-and-drop board
  │   └── prompts/                  Prompt forge
  ├── stores/
  │   ├── workspace-store.ts        Workspace CRUD + switching
  │   ├── terminal-store.ts         Terminal state per workspace
  │   ├── agent-store.ts            Agent pool + status
  │   ├── kanban-store.ts           Tasks + columns
  │   └── prompt-store.ts           Prompt versions
  └── hooks/
      ├── use-workspace.ts          Workspace lifecycle
      ├── use-pty.ts                PTY process management
      └── use-agent.ts              Agent communication
  ui/                     Design system: shadcn/ui + 40 themes
  i18n/                   10-language translations
  cli/                    Scaffolding tool
```

## Tech Stack

| Layer | Technology |
|---|---|
| Shell | Tauri 2 · Next.js 16 |
| UI | React 19 · Tailwind v4 · shadcn/ui |
| State | Zustand · localStorage |
| Terminal | xterm.js · node-pty |
| Agent runtime | Vercel AI SDK / LangChain |
| Drag & drop | @dnd-kit |
| Real-time | WebSocket |
| Persistence | SQLite (Tauri) · Supabase (web) |
| Build | Turborepo · pnpm |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+
- [Rust](https://www.rust-lang.org/tools/install) (required for desktop builds)

### Installation

```bash
git clone https://github.com/Bhagirathsinhrana378/Hyperion.git
cd Hyperion
pnpm install
```

### Run the web app

```bash
pnpm web dev
```

### Run the desktop app

```bash
pnpm tauri dev
```

### First run

1. Launch Hyperion.
2. Click **+ Create** in the sidebar and name your workspace.
3. Open a terminal — it's scoped to that workspace's project directory.
4. Create a task on the board and assign it to an agent.
5. Watch the agent work in its dedicated terminal pane.

## Open Source vs. Hosted

Hyperion is split into two parts:

| Component | Repository | License |
|---|---|---|
| **Application** (desktop + web client) | This repository | MIT — open source |
| **Website & hosted dashboard** | Private | Proprietary — closed source |

Everything you need to run Hyperion locally — the full application, all features described above — lives in this repository and is free and open source under the MIT license. Our marketing site and optional hosted/cloud offering are maintained in a private repository and are not covered by this license.

If you're only interested in running Hyperion yourself, you don't need anything from the private repository — clone this one and follow [Getting Started](#getting-started).

## Roadmap

- [x] Multi-workspace sidebar (create, switch, delete)
- [x] Workspace-scoped state isolation
- [ ] Multi-pane terminal grid with resizable splits
- [ ] Agent spawning from the task board with live status tracking
- [ ] Kanban board with drag-and-drop agent dispatch
- [ ] Prompt Forge — versioning and A/B testing
- [ ] Agent Swarm — dependency graph and parallel coordination
- [ ] Cross-platform release builds (Windows, macOS, Linux)
- [ ] Plugin system for custom agents

See the [open issues](../../issues) for the full list of proposed features and known issues.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Make your changes, then run:
   ```bash
   pnpm check       # Lint
   pnpm typecheck   # Type check
   pnpm build       # Build
   ```
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m "feat: add workspace switching"`)
5. Push to your branch (`git push origin feat/my-feature`)
6. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct and the process for submitting pull requests.

## Community

- 💬 [Discord](#) — chat with the team and other contributors
- 🐛 [Issues](../../issues) — report bugs or request features
- 💡 [Discussions](../../discussions) — share ideas and ask questions

## Security

If you discover a security vulnerability, please do **not** open a public issue. Instead, follow the process outlined in [SECURITY.md](SECURITY.md) to report it responsibly.

## License

This repository — the Hyperion application — is distributed under the MIT License. See [LICENSE](LICENSE) for details.

The Hyperion website and hosted dashboard are proprietary and maintained in a separate, private repository not covered by this license.

---

<div align="center">

Built with 🪐 by [BhagirathsinhRana378](https://github.com/Bhagirathsinhrana378) and [contributors](../../graphs/contributors)

</div>
