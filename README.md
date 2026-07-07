<div align="center">

# 🪐 Hyperion

**Agentic Workspace Environment for Parallel AI Coding**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-orange.svg)](https://tauri.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

</div>

---

> **Stop juggling 47 browser tabs to use AI agents.**
>
> Hyperion is a cross-platform workspace environment where you orchestrate multiple AI coding agents across different projects. Create a workspace per project in the sidebar — terminals, agents, tasks, and prompts update instantly. Each workspace is an **isolated command center**.

---

## Why Hyperion?

Developers using AI coding agents today are stuck in a loop:

```
Open terminal → run agent → switch to browser → check output → 
open notes → find prompt → copy prompt → switch back → 
paste prompt → agent fails → open terminal → debug → repeat
```

Hyperion kills this loop. **One workspace per project. Everything you need — terminals, agents, tasks, prompts — lives inside it.**

| Without Hyperion | With Hyperion |
|:---:|:---:|
| 12 terminal windows | Grid of scoped terminals |
| Copy-paste prompts from notes | Versioned prompt forge |
| Manually track what agents did | Kanban board with agent dispatch |
| Switch between 5 tools | One workspace, one view |
| One project at a time | Multi-workspace sidebar |

---

## Features

### 🗂️ Multi-Workspace System

The core of Hyperion. The sidebar holds all your workspaces — each one is a self-contained project environment.

```
┌──────────┐
│ SIDEBAR  │
│          │
│ 🟢 KeyKing│  ← Active workspace
│ ⚪ Ledgion│
│ ⚪ Synapse│
│ ⚪ WASSIST│
│          │
│ + Create │
└──────────┘
```

Switch a workspace → **everything changes**:
- Terminal grid loads that project's terminals
- Agent pool shows that project's agents
- Task board displays that project's tasks
- Prompt forge holds that project's prompts

Create unlimited workspaces. Each one is isolated. No cross-contamination.

---

### 🤖 Agent Grid

Run multiple AI coding agents in parallel, each in its own terminal pane.

```
┌───────────────┬───────────────┐
│   Agent-1     │   Agent-2     │
│   🔨 Auth     │   🔨 API      │
│   Status: ✅  │   Status: 🔄  │
├───────────────┼───────────────┤
│   Agent-3     │   Agent-4     │
│   🔨 UI       │   🔨 Tests    │
│   Status: ⏳  │   Status: ⏳  │
└───────────────┴───────────────┘
```

- Spawn agents from the task board or manually
- Each agent gets a dedicated terminal pane
- Real-time output streaming
- Stop, restart, or reassign agents on the fly

---

### 📟 Terminal Multiplexer

Tiled terminal panes with split support. Each terminal is scoped to the active workspace's project directory.

- **Split** horizontally or vertically
- **Resize** panes by dragging
- **Tabs** for quick switching
- **Scoped** — terminals belong to workspaces

Run dev servers, watch builds, monitor agent output — all in one view.

---

### 📋 Task Board (Kanban)

Create tasks, assign them to agents, track progress.

```
┌─────────────┬──────────────┬─────────────┬──────────┐
│  BACKLOG    │ IN PROGRESS  │   REVIEW    │   DONE   │
├─────────────┼──────────────┼─────────────┼──────────┤
│ Add login   │ Build REST   │ Fix auth    │ Init     │
│ page        │ endpoints    │ redirect    │ project  │
│             │              │             │          │
│ Write tests │ Setup DB     │             │ CI/CD    │
│ for API     │ schema       │             │ pipeline │
└─────────────┴──────────────┴─────────────┴──────────┘
```

**Drag a task onto an agent → it starts working.** Real-time status updates flow back to the board.

---

### ⚡ Prompt Forge

Version control your agent prompts. No more losing that perfect prompt in a chat history.

```
prompts/
├── build-api.md          v1.0 → v1.1 → v1.2
├── fix-bug.md            v1.0
├── write-tests.md        v1.0 → v1.1
└── refactor-auth.md      v1.0
```

- Create prompt templates per workspace
- Version and iterate
- A/B test different approaches
- Attach prompts to kanban tasks

---

### 🐝 Agent Swarm

For complex tasks that need multiple agents working together.

```
Agent-1: "Design database schema"
    ↓ (when done)
Agent-2: "Build API endpoints"     Agent-3: "Create UI components"
    ↓ (when both done)
Agent-4: "Write integration tests"
```

Define task dependencies. Hyperion orchestrates the execution order.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  HYPERION SHELL                      │
│           (Tauri 2 Desktop / Next.js Web)            │
├───────────┬─────────────────────────────────────────┤
│           │                                         │
│ SIDEBAR   │           WORKSPACE VIEW                │
│           │                                         │
│ ┌───────┐ │  ┌─────────────┬─────────────┐        │
│ │ Work- │ │  │ Terminal-1  │ Terminal-2  │        │
│ │ spaces│ │  │  (dev)      │  (test)     │        │
│ │       │ │  ├─────────────┼─────────────┤        │
│ │ 🟢 A  │ │  │  Agent-1    │  Agent-2    │        │
│ │ ⚪ B  │ │  │  Output     │  Output     │        │
│ │ ⚪ C  │ │  └─────────────┴─────────────┘        │
│ │       │ │  ┌─────────────────────────────┐      │
│ │ + New │ │  │    TASK BOARD (Kanban)       │      │
│ └───────┘ │  └─────────────────────────────┘      │
│           │  ┌─────────────────────────────┐      │
│           │  │    PROMPT FORGE              │      │
│           │  └─────────────────────────────┘      │
├───────────┴─────────────────────────────────────────┤
│                  BACKEND LAYER                       │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │  Workspace   │  │  PTY Pool    │               │
│  │  Manager     │  │  (terminals) │               │
│  ├──────────────┤  ├──────────────┤               │
│  │  Agent       │  │  WebSocket   │               │
│  │  Spawner     │  │  Server      │               │
│  ├──────────────┤  ├──────────────┤               │
│  │  Task        │  │  SQLite      │               │
│  │  Scheduler   │  │  (persistence)│              │
│  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User creates workspace
    → Workspace Manager creates isolated scope
    → Sidebar updates
    → Workspace view renders with empty terminal grid + board

User spawns agent on task
    → Agent Spawner launches process
    → PTY Pool allocates terminal
    → Agent Grid renders new pane
    → WebSocket streams output to terminal + board status

User switches workspace
    → Workspace Manager swaps active scope
    → Terminal grid re-renders with new terminals
    → Agent pool shows new workspace's agents
    → Task board loads new workspace's tasks
```

---

## Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Shell** | Tauri 2 / Next.js 16 | Cross-platform desktop + web |
| **UI** | React 19 + Tailwind v4 + shadcn/ui | Design system (40+ themes) |
| **State** | Zustand + localStorage | Workspace + agent state |
| **Terminal** | xterm.js + node-pty | Multi-pane terminal grid |
| **Agent Runtime** | Vercel AI SDK / LangChain | LLM agent orchestration |
| **Drag & Drop** | @dnd-kit | Task board interactions |
| **Real-time** | WebSocket | Terminal I/O + agent status |
| **Persistence** | SQLite (Tauri) / Supabase (Web) | Workspaces + prompts + tasks |
| **Build** | Turborepo + pnpm | Monorepo tooling |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri desktop builds)

### Setup

```bash
# Clone the repo
git clone https://github.com/Bhagirathsinhrana378/Hyperion.git
cd Hyperion

# Install dependencies
pnpm install

# Run web app
pnpm web dev

# Run desktop app
pnpm tauri dev
```

### First Run

1. Open Hyperion
2. Click **+ Create** in the sidebar
3. Name your workspace (e.g., "KeyKing")
4. Open a terminal → it's scoped to that workspace
5. Create a task on the board → assign to an agent
6. Watch the agent work in its terminal pane

---

## Workspace Deep Dive

Each workspace is a **complete project environment**:

```
Workspace: "KeyKing"
│
├── 📟 Terminals (project-scoped)
│   ├── Terminal 1: pnpm dev
│   ├── Terminal 2: pnpm test --watch
│   └── Terminal 3: git status
│
├── 🤖 Agents (task-bound)
│   ├── Agent 1: "Implement OAuth" → ✅ Complete
│   ├── Agent 2: "Build /api/users" → 🔄 Running
│   └── Agent 3: "Write integration tests" → ⏳ Queued
│
├── 📋 Tasks (kanban board)
│   ├── Backlog: [Setup CI, Add logging]
│   ├── In Progress: [Build REST API]
│   ├── Review: [Fix auth redirect]
│   └── Done: [Init project, Setup DB]
│
└── ⚡ Prompts (versioned)
    ├── build-rest-api.md     v1.0, v1.1
    ├── implement-oauth.md    v1.0
    └── write-tests.md        v1.0
```

Switch to workspace "Ledgion" → completely different terminals, agents, tasks, and prompts load. **Zero cross-contamination.**

---

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

---

## Roadmap

### Phase 1 — Foundation
- [ ] Multi-workspace sidebar (create, switch, delete)
- [ ] Workspace-scoped state isolation
- [ ] Basic terminal pane (single xterm.js instance)

### Phase 2 — Terminal Grid
- [ ] Multi-pane terminal grid (split horizontal/vertical)
- [ ] Resize panes by dragging
- [ ] Terminal scoped to workspace directory

### Phase 3 — Agent System
- [ ] Agent spawning from task board
- [ ] Real-time agent output in terminal panes
- [ ] Agent status tracking (running/complete/failed)
- [ ] Stop/restart/reassign agents

### Phase 4 — Task Board
- [ ] Kanban board with drag-and-drop
- [ ] Task creation, editing, deletion
- [ ] Agent dispatch via drag
- [ ] Real-time status sync

### Phase 5 — Prompt Forge
- [ ] Prompt template editor
- [ ] Version history per prompt
- [ ] Attach prompts to tasks/agents
- [ ] A/B testing different prompt versions

### Phase 6 — Agent Swarm
- [ ] Task dependency graph
- [ ] Sequential agent execution
- [ ] Parallel agent coordination
- [ ] Swarm status dashboard

### Phase 7 — Polish
- [ ] Cross-platform builds (Windows, macOS, Linux)
- [ ] Keyboard shortcuts
- [ ] Plugin system for custom agents
- [ ] Import/export workspaces

---

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Create a branch
git checkout -b feat/my-feature

# Make changes, then
pnpm check        # Lint
pnpm typecheck    # Type check
pnpm build        # Build

# Commit (Conventional Commits)
git commit -m "feat: add workspace switching"

# Push and open a PR
git push origin feat/my-feature
```

---

## License

[MIT](LICENSE) © [BhagirathsinhRana378](https://github.com/Bhagirathsinhrana378)
