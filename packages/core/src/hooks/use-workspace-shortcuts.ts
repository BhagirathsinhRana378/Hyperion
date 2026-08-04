"use client";

import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import { useHotkeys } from "react-hotkeys-hook";

/**
 * Registers Ctrl+1 through Ctrl+9 to switch workspaces by position.
 * Matches the workspace array order (index 0 = Ctrl+1, index 8 = Ctrl+9).
 */
export function useWorkspaceShortcuts() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const switchTo = (index: number) => {
    const ws = workspaces[index];
    if (ws) {
      setActiveWorkspace(ws.id);
    }
  };

  useHotkeys("ctrl+1", () => switchTo(0), {
    enableOnFormTags: false,
    enabled: workspaces.length > 0,
  });
  useHotkeys("ctrl+2", () => switchTo(1), {
    enableOnFormTags: false,
    enabled: workspaces.length > 1,
  });
  useHotkeys("ctrl+3", () => switchTo(2), {
    enableOnFormTags: false,
    enabled: workspaces.length > 2,
  });
  useHotkeys("ctrl+4", () => switchTo(3), {
    enableOnFormTags: false,
    enabled: workspaces.length > 3,
  });
  useHotkeys("ctrl+5", () => switchTo(4), {
    enableOnFormTags: false,
    enabled: workspaces.length > 4,
  });
  useHotkeys("ctrl+6", () => switchTo(5), {
    enableOnFormTags: false,
    enabled: workspaces.length > 5,
  });
  useHotkeys("ctrl+7", () => switchTo(6), {
    enableOnFormTags: false,
    enabled: workspaces.length > 6,
  });
  useHotkeys("ctrl+8", () => switchTo(7), {
    enableOnFormTags: false,
    enabled: workspaces.length > 7,
  });
  useHotkeys("ctrl+9", () => switchTo(8), {
    enableOnFormTags: false,
    enabled: workspaces.length > 8,
  });
}
