"use client";

import { TerminalPane } from "@workspace/core/components/terminal/terminal-pane";
import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";

function getGridClass(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1 grid-rows-1";
    case 2:
      return "grid-cols-2 grid-rows-1";
    case 3:
      return "grid-cols-3 grid-rows-1";
    case 4:
      return "grid-cols-2 grid-rows-2";
    case 5:
      return "grid-cols-3 grid-rows-2";
    case 6:
      return "grid-cols-3 grid-rows-2";
    case 7:
      return "grid-cols-4 grid-rows-2";
    case 8:
      return "grid-cols-4 grid-rows-2";
    default:
      return "grid-cols-1 grid-rows-1";
  }
}

export function TerminalGrid() {
  const mounted = useMounted();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading terminals...</p>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background/50">
        <p className="text-muted-foreground text-sm">
          No active workspace selected
        </p>
      </div>
    );
  }

  const { panes } = activeWorkspace;
  const gridClass = getGridClass(panes.length);

  return (
    <div
      className={`grid flex-1 gap-1.5 overflow-hidden bg-background p-1.5 ${gridClass}`}
    >
      {panes.map((pane, index) => (
        <TerminalPane
          id={pane.id}
          key={`${activeWorkspace.id}-${pane.id}`}
          title={`Terminal ${index + 1}`}
        />
      ))}
    </div>
  );
}
