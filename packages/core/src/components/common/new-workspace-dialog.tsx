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
import {
  FolderOpen,
  GitBranch,
  History,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
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

const SUGGESTIONS = [
  "E:\\Hyperion",
  "C:\\Users\\hyperion\\projects\\nextjs-app",
  "C:\\Users\\hyperion\\dev\\python-agent",
];

const AI_MODELS = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Recommended)" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Fast)" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
];

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

function LayoutPreview({
  count,
  isSelected,
}: {
  count: number;
  isSelected: boolean;
}) {
  const boxClass = cn(
    "rounded-[2px] border transition-colors duration-200",
    isSelected
      ? "border-primary/80 bg-primary/20 shadow-[0_0_4px_var(--primary)]"
      : "border-muted-foreground/30 bg-muted-foreground/5 group-hover:border-muted-foreground/50"
  );

  const getBoxes = (n: number) => {
    return Array.from({ length: n }, (_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static preview
      <div className={cn("size-2", boxClass)} key={i} />
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
          <div className="size-2 opacity-0" />
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
          <div className="size-2 opacity-0" />
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

function WorkspaceLivePreview({ count }: { count: number }) {
  const getBoxes = (n: number) =>
    Array.from({ length: n }, (_, i) => (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col overflow-hidden rounded-md border border-border/60 bg-[#08080a] shadow-inner"
        initial={{ opacity: 0, scale: 0.95 }}
        // biome-ignore lint/suspicious/noArrayIndexKey: static preview layout grid keys
        key={i}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 22,
          delay: i * 0.03,
        }}
      >
        <div className="flex h-4 select-none items-center justify-between border-border/30 border-b bg-[#0f0f12] px-1.5 font-mono text-[7px] text-muted-foreground/60">
          <span>Terminal {i + 1}</span>
          <span className="scale-90 rounded border border-blue-500/15 bg-blue-500/10 px-1 py-0.2 text-[6px] text-blue-400">
            Shell
          </span>
        </div>
        <div className="flex-1 select-none space-y-1 p-1.5 font-mono text-[7px] text-muted-foreground/25">
          <div className="flex items-center gap-0.5">
            <span className="font-bold text-emerald-500/25">
              hyperion@dev:~$
            </span>
            <div className="h-1.5 w-6 rounded bg-muted-foreground/5" />
          </div>
          <div className="h-1.5 w-[85%] rounded bg-muted-foreground/5" />
          <div className="h-1.5 w-[55%] rounded bg-muted-foreground/5" />
        </div>
      </motion.div>
    ));

  const gridClass = getGridClass(count);

  return (
    <div
      className={cn(
        "grid h-[180px] w-full gap-1 rounded-lg border border-border/30 bg-[#0b0b0d] p-1.5",
        gridClass
      )}
    >
      {getBoxes(count)}
    </div>
  );
}

const getAiModelLabel = (model: string) => {
  if (model === "gemini-2.5-pro") {
    return "Pro";
  }
  if (model === "gemini-1.5-flash") {
    return "Flash";
  }
  return "Sonnet";
};

export function NewWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: NewWorkspaceDialogProps) {
  const { createWorkspace, workspaces } = useWorkspaceStore();
  const [name, setName] = useState("");
  const [terminalCount, setTerminalCount] = useState(4);
  const [directory, setDirectory] = useState("E:\\Hyperion");
  const [gitEnabled, setGitEnabled] = useState(true);
  const [aiModel, setAiModel] = useState("gemini-2.5-pro");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (open) {
      setName(`Workspace ${workspaces.length + 1}`);
      setTerminalCount(4);
      setDirectory("E:\\Hyperion");
      setGitEnabled(true);
      setAiModel("gemini-2.5-pro");
    }
  }, [open, workspaces.length]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      // @ts-expect-error: path exists on Electron/Tauri files
      const path = file.path || file.name;
      setDirectory(path);
    }
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    createWorkspace(trimmed, terminalCount, directory, gitEnabled, aiModel);
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="border-border/80 p-6 shadow-2xl backdrop-blur-md focus:outline-none sm:max-w-[760px]">
        <DialogHeader className="gap-1 border-border/20 border-b pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="font-bold text-foreground text-lg tracking-tight">
                Create Workspace
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/70 text-xs">
                Set up a custom dev environment with terminal layouts and
                initial configs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-6 py-4 md:grid-cols-12"
          initial={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", duration: 0.45 }}
        >
          {/* Left Configuration Column */}
          <div className="space-y-4 md:col-span-7">
            {/* Workspace Name */}
            <div className="grid gap-1.5">
              <Label
                className="font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider"
                htmlFor="ws-name"
              >
                Workspace Name
              </Label>
              <Input
                autoFocus
                className="h-9 border-border/40 bg-background/30 text-sm focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
                id="ws-name"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Next.js Dev Backend"
                value={name}
              />
            </div>

            {/* Working Directory drag-drop input */}
            <div className="grid gap-1.5">
              <Label className="font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                Working Directory
              </Label>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop region */}
              {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag-and-drop region */}
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border border-dashed bg-background/25 p-3 transition-colors hover:border-border hover:bg-background/40",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border/40"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex w-full items-center gap-2">
                  <Input
                    className="h-8 flex-1 border-transparent bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e) => setDirectory(e.target.value)}
                    value={directory}
                  />
                  <Button
                    className="size-7 text-muted-foreground hover:bg-muted"
                    size="icon"
                    variant="ghost"
                  >
                    <FolderOpen className="size-4" />
                  </Button>
                </div>
                <div className="mt-1.5 select-none text-center text-[9px] text-muted-foreground/50">
                  Drag and drop a folder here to select path
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="flex items-center gap-0.5 font-semibold text-[9px] text-muted-foreground/40">
                  <History className="size-2.5" /> Recent:
                </span>
                {SUGGESTIONS.map((path) => (
                  <button
                    className="rounded border border-border/30 bg-muted/20 px-1.5 py-0.5 text-[9px] text-muted-foreground/60 transition-all hover:border-primary/20 hover:text-primary"
                    key={path}
                    onClick={() => setDirectory(path)}
                    type="button"
                  >
                    {path.split("\\").pop() || path}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Grid Selector */}
            <div className="grid gap-1.5">
              <Label className="font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                Terminal Layout
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }, (_, i) => {
                  const count = i + 1;
                  const isSelected = count === terminalCount;
                  return (
                    <motion.button
                      className={cn(
                        "group relative flex h-14 flex-col items-center justify-center gap-1.5 rounded-lg border text-sm transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/[0.04] text-primary shadow-primary/[0.02] shadow-sm"
                          : "border-border/40 bg-background/25 text-muted-foreground hover:border-border/80 hover:text-foreground"
                      )}
                      key={count}
                      onClick={() => setTerminalCount(count)}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LayoutPreview count={count} isSelected={isSelected} />
                      <span className="font-bold font-mono text-[10px] leading-none">
                        {count} {count === 1 ? "Pane" : "Panes"}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Preview Column */}
          <div className="flex flex-col justify-between space-y-4 border-border/20 border-l pl-5 md:col-span-5">
            <div className="space-y-4">
              <Label className="block font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                Workspace Preview
              </Label>
              <WorkspaceLivePreview count={terminalCount} />

              {/* Git Checkbox Integration */}
              <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/25 p-2.5">
                <input
                  checked={gitEnabled}
                  className="size-3.5 cursor-pointer rounded border-border/40 bg-background text-primary focus:ring-primary/20"
                  id="git-init"
                  onChange={(e) => setGitEnabled(e.target.checked)}
                  type="checkbox"
                />
                <div className="min-w-0 flex-1">
                  <Label
                    className="flex cursor-pointer items-center gap-1 font-semibold text-foreground text-xs"
                    htmlFor="git-init"
                  >
                    <GitBranch className="size-3.5 text-muted-foreground" />{" "}
                    Initialize Git Repository
                  </Label>
                  <p className="text-[9px] text-muted-foreground/60">
                    Detect or scaffold version control.
                  </p>
                </div>
              </div>

              {/* AI Agent Selection */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                  <Sparkles className="size-3" /> AI Assistant Agent
                </Label>
                <select
                  className="h-8.5 w-full rounded-lg border border-border/40 bg-[#0b0b0d] px-2 text-muted-foreground text-xs focus:border-primary/50 focus:outline-none"
                  onChange={(e) => setAiModel(e.target.value)}
                  value={aiModel}
                >
                  {AI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Details */}
            <div className="border-border/20 border-t pt-2">
              <div className="space-y-1 text-[10px] text-muted-foreground/75">
                <div className="flex justify-between">
                  <span>Layout:</span>
                  <span className="font-bold font-mono text-foreground">
                    {LAYOUTS[terminalCount]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Directory:</span>
                  <span className="max-w-[120px] truncate font-bold font-mono text-foreground">
                    {directory.split("\\").pop() || directory}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>AI Config:</span>
                  <span className="font-bold font-mono text-foreground">
                    {getAiModelLabel(aiModel)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <DialogFooter className="gap-2 border-border/20 border-t pt-3">
          <Button
            className="h-8.5 border border-border/40 text-xs hover:bg-muted/50"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            className="h-8.5 px-5 font-bold text-xs shadow-lg shadow-primary/20"
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
