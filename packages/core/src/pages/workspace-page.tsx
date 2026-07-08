"use client";

import { NewWorkspaceDialog } from "@workspace/core/components/common/new-workspace-dialog";
import { TerminalGrid } from "@workspace/core/components/terminal/terminal-grid";
import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import { Button } from "@workspace/ui/components/button";
import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";

export function WorkspacePage() {
  const mounted = useMounted();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!mounted) {
    return null;
  }

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  if (!activeWorkspace) {
    return (
      <>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background p-6">
          <div className="flex max-w-md flex-col items-center gap-5 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border/30 bg-muted/60 shadow-sm">
              <LayoutGrid className="size-6 text-muted-foreground/80" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-bold text-foreground text-lg tracking-tight">
                No active workspace
              </h2>
              <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
                Create a workspace to instantly spawn independent real system
                terminal instances.
              </p>
            </div>
            <Button
              className="px-5 shadow-lg shadow-primary/10"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-1.5 size-4" />
              Create Workspace
            </Button>
          </div>
        </div>
        <NewWorkspaceDialog onOpenChange={setDialogOpen} open={dialogOpen} />
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TerminalGrid />
    </div>
  );
}
