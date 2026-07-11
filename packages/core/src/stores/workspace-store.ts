"use client";

import { safeUUID } from "@workspace/core/lib/uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TerminalPane {
  id: string;
  title: string;
}

export interface Workspace {
  autoCommand?: string;
  createdAt: number;
  directory?: string;
  id: string;
  isPinned?: boolean;
  name: string;
  panes: TerminalPane[];
  terminalCount: number;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  createWorkspace: (
    name: string,
    terminalCount: number,
    directory?: string,
    autoCommand?: string
  ) => Workspace;
  deleteWorkspace: (id: string) => void;
  duplicateWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  setActiveWorkspace: (id: string) => void;
  togglePinWorkspace: (id: string) => void;
  workspaces: Workspace[];
}

function generateId(): string {
  return safeUUID();
}

function createPanes(count: number): TerminalPane[] {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    title: `Terminal ${i + 1}`,
  }));
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      workspaces: [],
      createWorkspace: (
        name: string,
        terminalCount: number,
        directory?: string,
        autoCommand?: string
      ) => {
        const clamped = Math.min(8, Math.max(1, terminalCount));
        const workspace: Workspace = {
          createdAt: Date.now(),
          id: generateId(),
          name,
          terminalCount: clamped,
          panes: createPanes(clamped),
          directory,
          autoCommand,
          isPinned: false,
        };
        set((state) => ({
          activeWorkspaceId: workspace.id,
          workspaces: [...state.workspaces, workspace],
        }));
        return workspace;
      },
      deleteWorkspace: (id: string) => {
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === id);
          if (workspace) {
            import("@tauri-apps/api/core")
              .then(({ isTauri, invoke }) => {
                if (isTauri()) {
                  for (const pane of workspace.panes) {
                    invoke("close_terminal", { id: pane.id }).catch(() => {
                      /* ignore */
                    });
                  }
                }
              })
              .catch(() => {
                /* ignore */
              });
          }

          const remaining = state.workspaces.filter((w) => w.id !== id);
          return {
            activeWorkspaceId:
              state.activeWorkspaceId === id
                ? (remaining[0]?.id ?? null)
                : state.activeWorkspaceId,
            workspaces: remaining,
          };
        });
      },
      duplicateWorkspace: (id: string) => {
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === id);
          if (!workspace) {
            return {};
          }
          const duplicated: Workspace = {
            ...workspace,
            id: generateId(),
            createdAt: Date.now(),
            name: `${workspace.name} (Copy)`,
            panes: createPanes(workspace.terminalCount),
            isPinned: false,
          };
          return {
            workspaces: [...state.workspaces, duplicated],
            activeWorkspaceId: duplicated.id,
          };
        });
      },
      renameWorkspace: (id: string, name: string) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, name } : w
          ),
        }));
      },
      setActiveWorkspace: (id: string) => {
        set({ activeWorkspaceId: id });
      },
      togglePinWorkspace: (id: string) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, isPinned: !w.isPinned } : w
          ),
        }));
      },
    }),
    {
      name: "hyperion-workspaces-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
