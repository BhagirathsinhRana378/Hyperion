"use client";

import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";

interface NewWorkspaceDialogProps {
  onCreated?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const LAYOUTS: Record<number, string> = {
  1: "Full screen",
  2: "2 columns",
  3: "3 columns",
  4: "2×2 grid",
  5: "3+2 grid",
  6: "3×2 grid",
  7: "4+3 grid",
  8: "4×2 grid",
};

function LayoutPreview({
  count,
  isSelected,
}: {
  count: number;
  isSelected: boolean;
}) {
  const boxClass = cn(
    "rounded-[2px] border transition-colors",
    isSelected
      ? "border-primary bg-primary/20"
      : "border-muted-foreground/30 bg-muted-foreground/5"
  );

  const getBoxes = (n: number) => {
    return Array.from({ length: n }, (_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static boxes layout key
      <div className={cn("size-2.5", boxClass)} key={i} />
    ));
  };

  switch (count) {
    case 1:
      return <div className="grid grid-cols-1 gap-0.5">{getBoxes(1)}</div>;
    case 2:
      return <div className="grid grid-cols-2 gap-0.5">{getBoxes(2)}</div>;
    case 3:
      return <div className="grid grid-cols-3 gap-0.5">{getBoxes(3)}</div>;
    case 4:
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
          {getBoxes(4)}
        </div>
      );
    case 5:
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5">
          {getBoxes(5)}
          <div className="size-2.5 opacity-0" />
        </div>
      );
    case 6:
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5">
          {getBoxes(6)}
        </div>
      );
    case 7:
      return (
        <div className="grid grid-cols-4 grid-rows-2 gap-0.5">
          {getBoxes(7)}
          <div className="size-2.5 opacity-0" />
        </div>
      );
    case 8:
      return (
        <div className="grid grid-cols-4 grid-rows-2 gap-0.5">
          {getBoxes(8)}
        </div>
      );
    default:
      return null;
  }
}

export function NewWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: NewWorkspaceDialogProps) {
  const { createWorkspace, workspaces } = useWorkspaceStore();
  const [name, setName] = useState("");
  const [terminalCount, setTerminalCount] = useState(4);

  // Set default workspace name when opening
  useEffect(() => {
    if (open) {
      setName(`Workspace ${workspaces.length + 1}`);
      setTerminalCount(4);
    }
  }, [open, workspaces.length]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    createWorkspace(trimmed, terminalCount);
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="rounded-xl border border-border/80 bg-[#201E18] p-6 shadow-2xl ring-1 ring-white/5 backdrop-blur-md sm:max-w-[420px]">
        <DialogHeader className="gap-1.5 pb-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutGrid className="size-5" />
          </div>
          <DialogTitle className="font-bold text-foreground text-xl tracking-tight">
            Create Workspace
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80 text-sm">
            Set up an isolated environment with up to 8 real terminal processes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label
              className="font-semibold text-muted-foreground text-xs uppercase tracking-wider"
              htmlFor="ws-name"
            >
              Workspace Name
            </Label>
            <Input
              autoFocus
              className="h-10 border-border/60 bg-background/40 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
              id="ws-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next.js Dev Backend"
              value={name}
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Terminals Grid Layout
              </Label>
              <span className="rounded border border-border/30 bg-background/50 px-2 py-0.5 font-mono font-semibold text-[10px] text-muted-foreground uppercase">
                {LAYOUTS[terminalCount] || "Custom"}
              </span>
            </div>

            {/* Premium selector grid */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => {
                const count = i + 1;
                const isSelected = count === terminalCount;
                return (
                  <button
                    className={cn(
                      "group relative flex h-16 flex-col items-center justify-center gap-2 rounded-lg border font-semibold text-sm transition-all",
                      isSelected
                        ? "scale-[1.02] border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/25"
                        : "border-border/60 bg-background/20 text-muted-foreground hover:border-border hover:bg-background/40 hover:text-foreground"
                    )}
                    key={count}
                    onClick={() => setTerminalCount(count)}
                    type="button"
                  >
                    <LayoutPreview count={count} isSelected={isSelected} />
                    <span className="font-bold font-mono text-xs leading-none">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            className="border border-border/40 hover:bg-muted/50"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            className="px-5 font-bold shadow-lg shadow-primary/20"
            disabled={!name.trim()}
            onClick={handleCreate}
            type="button"
          >
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
