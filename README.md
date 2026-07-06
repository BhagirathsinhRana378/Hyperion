# Hyperion

A starting point for building cross-platform apps. Covers Web, Desktop (Windows, macOS, Linux), and Mobile (Android, iOS) from the same shared UI, themes, and logic.

## 🚀 Quick Start

### Prerequisites

- **[Node.js](https://nodejs.org/)** v20 or higher
- **[pnpm](https://pnpm.io/installation)** v8 or higher
- **[Rust](https://www.rust-lang.org/tools/install)** (latest stable, needed for native builds)

### Start Developing

```bash
pnpm install
pnpm dev
```

This starts both the web app (http://localhost:3000) and the native desktop app in parallel.

## ⌨️ Core Commands

```bash
pnpm dev                  # Start all apps in dev mode
pnpm build                # Build everything
pnpm check                # Check formatting and lint rules
pnpm fix                  # Auto-fix formatting and lint issues
pnpm typecheck            # TypeScript validation across all workspaces
pnpm web dev              # Web app only
pnpm tauri dev            # Desktop app only
pnpm tauri android dev    # Android app
pnpm tauri ios dev        # iOS app
pnpm shadcn add           # Add shadcn/ui components to packages/ui
pnpm clean                # Clean all build outputs
```

## 📦 Overview

### Monorepo Structure

```
apps/
  web/                → Next.js SSR — web app, landing page, docs, PWA
  native/             → Next.js (Static) + Tauri 2 — desktop & mobile

packages/
  core/               → Business logic: pages, stores, hooks, providers, config
  ui/                 → Design system: shadcn/ui primitives, themes, styles
  i18n/               → 10-language type-safe translations (SSR & static)
  cli/                → Scaffolding tool (npm create hyperion@latest)
  typescript-config/  → Shared TypeScript configs
```
