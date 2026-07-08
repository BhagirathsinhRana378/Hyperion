"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TerminalPane {
  id: string;
  title: string;
}

export interface Workspace {
  createdAt: number;
  id: string;
  name: string;
  panes: TerminalPane[];
  terminalCount: number;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  createWorkspace: (name: string, terminalCount: number) => Workspace;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  setActiveWorkspace: (id: string) => void;
  workspaces: Workspace[];
}

function generateId(): string {
  return crypto.randomUUID();
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
      createWorkspace: (name: string, terminalCount: number) => {
        const clamped = Math.min(8, Math.max(1, terminalCount));
        const workspace: Workspace = {
          createdAt: Date.now(),
          id: generateId(),
          name,
          terminalCount: clamped,
          panes: createPanes(clamped),
        };
        set((state) => ({
          activeWorkspaceId: workspace.id,
          workspaces: [...state.workspaces, workspace],
        }));
        return workspace;
      },
      deleteWorkspace: (id: string) => {
        set((state) => {
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
    }),
    {
      name: "hyperion-workspaces-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
