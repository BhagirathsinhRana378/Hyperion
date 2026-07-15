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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import {
  FolderOpen,
  History,
  LayoutGrid,
  Sparkles,
  Terminal,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NewWorkspaceDialogProps {
  onCreated?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const LAYOUTS: Record<number, string> = {
  1: "1 Pane",
  2: "2 Panes",
  3: "3 Panes",
  4: "4 Panes",
  5: "5 Panes",
  6: "6 Panes",
  7: "7 Panes",
  8: "8 Panes",
};

const PATH_SEPARATOR_REGEX = /[/\\]/;

const _SUGGESTIONS = [
  "E:\\Hyperion",
  "C:\\Users\\hyperion\\projects\\nextjs-app",
  "C:\\Users\\hyperion\\dev\\python-agent",
];

interface AIAgent {
  action: "Launch" | "Install";
  command: string;
  description: string;
  installCommand: string;
  name: string;
  status: "Installed" | "Not Installed";
}

const AI_AGENTS: AIAgent[] = [
  {
    name: "OpenAI Codex CLI",
    description: "Interactive helper for OpenAI Codex model prompts.",
    command: "codex",
    installCommand: "npm install -g openai-codex-cli",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "Claude Code",
    description: "Anthropic's official agent for fast, local agentic coding.",
    command: "claude",
    installCommand: "npm install -g @anthropic-ai/claude-code",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "Gemini CLI",
    description: "Developer terminal agent powered by Google Gemini APIs.",
    command: "gemini-cli",
    installCommand: "npm install -g @google/gemini-cli",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "OpenCode CLI",
    description: "Decentralized developer terminal agent client.",
    command: "opencode",
    installCommand: "npm install -g @opencode/cli",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "Aider",
    description: "Top-tier Git-integrated CLI AI pair programmer.",
    command: "aider",
    installCommand: "pip install aider-chat",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "Amazon Q Developer CLI",
    description: "Command-line AI coding assistant from AWS.",
    command: "q",
    installCommand: "npm install -g @aws-amzn-q/cli",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "Goose",
    description: "Robust terminal-first agentic coding framework.",
    command: "goose run",
    installCommand: "pip install goose-ai",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "Amp CLI",
    description: "High-performance IDE configuration loader.",
    command: "amp",
    installCommand: "npm install -g amp-cli",
    status: "Not Installed",
    action: "Install",
  },
];

interface InstallerTool {
  action: "Install" | "Update" | "Launch";
  category: string;
  description: string;
  installCommand: string;
  name: string;
  status: "Installed" | "Not Installed" | "Update Available";
}

const INSTALLER_TOOLS: InstallerTool[] = [
  {
    name: "Node.js (LTS)",
    category: "JavaScript",
    description: "JavaScript runtime environment.",
    installCommand: "winget install OpenJS.NodeJS.LTS",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "pnpm",
    category: "JavaScript",
    description: "Fast, disk space efficient package manager.",
    installCommand: "npm install -g pnpm",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "Bun",
    category: "JavaScript",
    description: "All-in-one JavaScript runtime and toolkit.",
    installCommand: 'powershell -c "irm bun.sh/install.ps1 | iex"',
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "Python",
    category: "Python",
    description: "Versatile programming language for script/AI.",
    installCommand: "winget install Python.Python.3.11",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "uv",
    category: "Python",
    description: "Extremely fast Python package installer.",
    installCommand: "pip install uv",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "Rust",
    category: "Rust",
    description: "Systems programming language focused on safety.",
    installCommand: "winget install Rustlang.Rustup",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "Git",
    category: "Git",
    description: "Distributed version control system.",
    installCommand: "winget install Git.Git",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "GitHub CLI",
    category: "Git",
    description: "GitHub command line tool.",
    installCommand: "winget install GitHub.cli",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "Docker Desktop",
    category: "Containers",
    description: "Containerization developer platform.",
    installCommand: "winget install Docker.DockerDesktop",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "PostgreSQL",
    category: "Database",
    description: "Powerful open-source relational database.",
    installCommand: "winget install PostgreSQL.PostgreSQL",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "MongoDB",
    category: "Database",
    description: "NoSQL document-based database.",
    installCommand: "winget install MongoDB.Server",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "Firebase CLI",
    category: "Cloud",
    description: "Firebase command-line tools.",
    installCommand: "npm install -g firebase-tools",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "Supabase CLI",
    category: "Cloud",
    description: "Supabase local development toolset.",
    installCommand: "npm install -g supabase",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "Vercel CLI",
    category: "Cloud",
    description: "Vercel cloud deployment interface.",
    installCommand: "npm install -g vercel",
    status: "Update Available",
    action: "Update",
  },
  {
    name: "Ollama",
    category: "AI",
    description: "Run large language models locally.",
    installCommand: "winget install Ollama.Ollama",
    status: "Not Installed",
    action: "Install",
  },
  {
    name: "WSL",
    category: "Terminal",
    description: "Windows Subsystem for Linux.",
    installCommand: "wsl --install",
    status: "Installed",
    action: "Launch",
  },
  {
    name: "PowerShell 7",
    category: "Terminal",
    description: "Modern cross-platform command-line shell.",
    installCommand: "winget install Microsoft.PowerShell",
    status: "Installed",
    action: "Launch",
  },
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
      return "grid-cols-6 grid-rows-2"; // 6 cols for symmetrical 3+2
    case 6:
      return "grid-cols-3 grid-rows-2";
    case 7:
      return "grid-cols-12 grid-rows-2"; // 12 cols for symmetrical 4+3
    case 8:
      return "grid-cols-4 grid-rows-2";
    default:
      return "grid-cols-1 grid-rows-1";
  }
}

function getPaneClass(totalCount: number, index: number): string {
  if (totalCount === 5) {
    return index < 3 ? "col-span-2" : "col-span-3";
  }
  if (totalCount === 7) {
    return index < 4 ? "col-span-3" : "col-span-4";
  }
  return "";
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
        <div className="grid w-[26px] grid-cols-6 gap-0.5">
          <div className={cn("col-span-2 h-2", boxClass)} />
          <div className={cn("col-span-2 h-2", boxClass)} />
          <div className={cn("col-span-2 h-2", boxClass)} />
          <div className={cn("col-span-3 h-2", boxClass)} />
          <div className={cn("col-span-3 h-2", boxClass)} />
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
        <div className="grid w-[26px] grid-cols-12 gap-0.5">
          <div className={cn("col-span-3 h-2", boxClass)} />
          <div className={cn("col-span-3 h-2", boxClass)} />
          <div className={cn("col-span-3 h-2", boxClass)} />
          <div className={cn("col-span-3 h-2", boxClass)} />
          <div className={cn("col-span-4 h-2", boxClass)} />
          <div className={cn("col-span-4 h-2", boxClass)} />
          <div className={cn("col-span-4 h-2", boxClass)} />
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

function WorkspaceLivePreview({
  count,
  autoCommand,
}: {
  count: number;
  autoCommand: string;
}) {
  const [typedText, setTypedText] = useState("");
  const targetText = autoCommand || "npm run dev";

  useEffect(() => {
    let isCancelled = false;
    setTypedText("");
    let i = 0;
    const interval = setInterval(() => {
      if (isCancelled) {
        return;
      }
      if (i < targetText.length) {
        setTypedText((prev) => prev + targetText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [targetText]);

  const getBoxes = (n: number) =>
    Array.from({ length: n }, (_, i) => {
      const isFirst = i === 0;
      return (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-[#050508]/98 transition-all duration-300",
            getPaneClass(count, i),
            isFirst
              ? "border-primary/45 shadow-[0_0_15px_rgba(255,224,194,0.06)]"
              : "border-border/20"
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          // biome-ignore lint/suspicious/noArrayIndexKey: static preview layout grid keys
          key={i}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 22,
            delay: i * 0.04,
          }}
        >
          {/* Terminal Window Header */}
          <div className="flex h-5 select-none items-center justify-between border-border/10 border-b bg-[#0a0a0e] px-2 font-mono text-[7.5px] text-muted-foreground/60">
            <div className="flex min-w-0 items-center gap-1">
              {/* Window dots */}
              <div className="size-1.5 shrink-0 rounded-full bg-rose-500/50" />
              <div className="size-1.5 shrink-0 rounded-full bg-amber-500/50" />
              <div className="size-1.5 shrink-0 rounded-full bg-emerald-500/50" />
              <span className="ml-1 truncate text-[7px] opacity-75">zsh</span>
            </div>
            <span className="shrink-0 scale-90 rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[6.5px] text-primary/70">
              Terminal {i + 1}
            </span>
          </div>

          {/* Terminal Window Content */}
          <div className="min-w-0 flex-1 select-none space-y-2 overflow-hidden p-2 font-mono text-[8px] text-muted-foreground/50 leading-normal">
            {isFirst ? (
              <>
                <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                  <span className="shrink-0 font-bold text-emerald-500/80">
                    hyperion@dev:~$
                  </span>
                  <span className="truncate font-mono font-semibold text-foreground tracking-wide">
                    {typedText}
                    <span className="ml-0.5 inline-block h-2.5 w-1 animate-pulse bg-primary align-middle" />
                  </span>
                </div>
                <div className="min-w-0 space-y-1 overflow-hidden text-[7px] text-muted-foreground/45">
                  {autoCommand ? (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="truncate font-mono text-primary/70"
                      initial={{ opacity: 0, y: 2 }}
                      transition={{ duration: 0.3 }}
                    >
                      &gt; Init agent...
                    </motion.div>
                  ) : (
                    <div className="truncate font-mono text-muted-foreground/30">
                      &gt; Standby...
                    </div>
                  )}
                  <div className="h-0.5 w-[80%] rounded-full bg-muted/10" />
                  <div className="h-0.5 w-[55%] rounded-full bg-muted/10" />
                </div>
              </>
            ) : (
              <>
                <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                  <span className="shrink-0 font-bold text-muted-foreground/20">
                    hyperion@dev:~$
                  </span>
                  <span className="truncate font-mono text-muted-foreground/15">
                    ...
                  </span>
                </div>
                <div className="min-w-0 space-y-1 overflow-hidden">
                  <div className="h-0.5 w-[65%] rounded-full bg-muted/5" />
                  <div className="h-0.5 w-[40%] rounded-full bg-muted/5" />
                </div>
              </>
            )}
          </div>
        </motion.div>
      );
    });

  const gridClass = getGridClass(count);

  return (
    <div
      className={cn(
        "relative grid h-[140px] w-full gap-2 overflow-hidden rounded-xl border border-border/20 bg-[#030305] p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]",
        gridClass
      )}
    >
      {getBoxes(count)}
    </div>
  );
}

const getCommandLabel = (cmd: string) => {
  if (!cmd) {
    return "None";
  }
  return cmd.length > 20 ? `${cmd.slice(0, 18)}...` : cmd;
};

export function NewWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: NewWorkspaceDialogProps) {
  const {
    createWorkspace,
    workspaces,
    recentDirectories = [],
  } = useWorkspaceStore();
  const [name, setName] = useState("");
  const [terminalCount, setTerminalCount] = useState(4);
  const [directory, setDirectory] = useState("E:\\Hyperion");
  const [autoCommand, setAutoCommand] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [_copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(cmd);
      setTimeout(() => setCopiedCmd(null), 2000);
      toast.success("Command copied to clipboard!");
    } catch {
      toast.error("Failed to copy command");
    }
  };

  useEffect(() => {
    if (open) {
      setName(`Workspace ${workspaces.length + 1}`);
      setTerminalCount(4);
      setDirectory(recentDirectories[0] || "");
      setAutoCommand("");
    }
  }, [open, workspaces.length, recentDirectories]);

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

  const handleSelectDirectory = async () => {
    try {
      const { isTauri } = await import("@tauri-apps/api/core");
      if (isTauri()) {
        const { open: openDialog } = await import("@tauri-apps/plugin-dialog");
        const selected = await openDialog({
          directory: true,
          multiple: false,
        });
        if (selected && typeof selected === "string") {
          setDirectory(selected);
        }
      }
    } catch (e) {
      console.error("Error opening dialog", e);
    }
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    createWorkspace(trimmed, terminalCount, directory, autoCommand);
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden border-border/85 bg-[#09090d]/98 p-0 shadow-3xl backdrop-blur-xl focus:outline-none sm:max-w-[950px]">
        <DialogHeader className="flex-shrink-0 border-border/10 border-b p-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 animate-pulse items-center justify-center rounded-xl bg-primary/10 text-primary shadow-primary/5 shadow-sm">
              <LayoutGrid className="size-5" />
            </div>
            <div>
              <DialogTitle className="select-none font-bold text-foreground text-xl tracking-tight">
                Create Workspace
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/75 text-xs">
                Set up a custom dev environment with terminal layouts and
                initial configs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable middle container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/15 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/25 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-12"
            initial={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.45 }}
          >
            {/* Left Configuration Column */}
            <div className="space-y-3 md:col-span-7">
              {/* Workspace Name */}
              <div className="grid gap-1.5">
                <Label
                  className="select-none font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider"
                  htmlFor="ws-name"
                >
                  Workspace Name
                </Label>
                <Input
                  autoFocus
                  className="h-9.5 border-border/40 bg-background/20 text-sm transition-all duration-200 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
                  id="ws-name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Next.js Dev Backend"
                  value={name}
                />
              </div>

              {/* Working Directory drag-drop input */}
              <div className="grid gap-1.5">
                <Label className="select-none font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                  Working Directory
                </Label>
                {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop region */}
                {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag-and-drop region */}
                <div
                  className={cn(
                    "relative flex items-center rounded-lg border transition-all duration-300",
                    dragActive
                      ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(255,224,194,0.05)]"
                      : "border-transparent"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Input
                    className="h-9.5 w-full border-border/40 bg-[#07070a]/20 pr-10 font-mono text-foreground text-xs tracking-wide transition-all focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
                    onChange={(e) => setDirectory(e.target.value)}
                    placeholder="Drag & drop folder or browse path..."
                    value={directory}
                  />
                  <Button
                    className="absolute right-1 size-7.5 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={handleSelectDirectory}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <FolderOpen className="size-4" />
                  </Button>
                </div>

                {/* Directory History list */}
                {recentDirectories && recentDirectories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="flex items-center gap-1 font-bold text-[8.5px] text-muted-foreground/40 uppercase tracking-wider">
                      <History className="size-2.5" /> Recent:
                    </span>
                    {recentDirectories.map((dir) => (
                      <button
                        className="rounded border border-border/30 bg-[#07070a]/35 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/60 transition-all duration-200 hover:border-primary/25 hover:text-primary"
                        key={dir}
                        onClick={() => setDirectory(dir)}
                        title={dir}
                        type="button"
                      >
                        {dir.split(PATH_SEPARATOR_REGEX).pop() || dir}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Terminal Layout Grid Selection */}
              <div className="grid gap-1.5">
                <Label className="select-none font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                  Terminal Layout
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(LAYOUTS).map(([countStr, label]) => {
                    const count = Number.parseInt(countStr, 10);
                    const isSelected = terminalCount === count;
                    return (
                      <button
                        className={cn(
                          "group flex flex-col items-center justify-center gap-1.5 rounded-lg border py-2 text-center transition-all duration-300",
                          isSelected
                            ? "border-primary/45 bg-primary/[0.04] shadow-[0_4px_12px_rgba(255,224,194,0.04)]"
                            : "border-border/30 bg-[#07070a]/20 hover:border-border/70 hover:bg-background/40"
                        )}
                        key={count}
                        onClick={() => setTerminalCount(count)}
                        type="button"
                      >
                        <LayoutPreview count={count} isSelected={isSelected} />
                        <span className="font-bold text-[9.5px] text-muted-foreground tracking-wide transition-colors group-hover:text-foreground">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workspace Preview */}
              <div className="space-y-2">
                <Label className="block select-none font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                  Workspace Preview
                </Label>
                <WorkspaceLivePreview
                  autoCommand={autoCommand}
                  count={terminalCount}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col justify-between space-y-3 border-border/20 border-l pl-5 md:col-span-5">
              <div className="space-y-3">
                {/* Auto Command Configuration */}
                <div className="space-y-1.5">
                  <Label className="flex select-none items-center gap-1.5 font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                    <Terminal className="size-3 text-muted-foreground/80" />{" "}
                    Auto-run Command
                  </Label>
                  <div className="flex w-full items-center gap-2 rounded-lg border border-border/40 bg-[#060608] px-2.5 py-0.5 transition-colors focus-within:border-primary/45">
                    <Input
                      className="h-8.5 flex-1 border-transparent bg-transparent p-0 font-mono text-foreground text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                      onChange={(e) => setAutoCommand(e.target.value)}
                      placeholder="e.g. npm run dev"
                      value={autoCommand}
                    />
                  </div>
                  {/* Command Shortcuts */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[
                      "npm run dev",
                      "pnpm dev",
                      "python main.py",
                      "docker-compose up",
                    ].map((cmd) => (
                      <button
                        className="rounded border border-border/30 bg-muted/10 px-2 py-0.5 text-[9px] text-muted-foreground/60 transition-all duration-200 hover:border-primary/20 hover:text-primary"
                        key={cmd}
                        onClick={() => setAutoCommand(cmd)}
                        type="button"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI CLI Agent Templates & Installers */}
                <div className="grid gap-2 border-border/10 border-t pt-3.5">
                  <Label className="flex select-none items-center gap-1.5 font-bold text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                    <Sparkles className="size-3 animate-pulse text-primary" />{" "}
                    AI Agent CLI Library
                  </Label>

                  <Tabs className="mt-1 w-full" defaultValue="runnable">
                    <TabsList className="grid h-8 w-full grid-cols-2 border border-border/10 bg-muted/20 p-1">
                      <TabsTrigger
                        className="py-1 font-bold text-[10px] uppercase"
                        value="runnable"
                      >
                        Runnable AI CLI Agents
                      </TabsTrigger>
                      <TabsTrigger
                        className="py-1 font-bold text-[10px] uppercase"
                        value="installer"
                      >
                        Installers & Setups
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      className="mt-2.5 max-h-[140px] space-y-1.5 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value="runnable"
                    >
                      {AI_AGENTS.map((agent) => {
                        const isSelected = autoCommand === agent.command;
                        const isInstalled = agent.status === "Installed";
                        return (
                          <div
                            className={cn(
                              "group/card flex items-center justify-between rounded-lg border px-3 py-1.5 transition-all duration-300",
                              isSelected
                                ? "border-primary/45 bg-primary/[0.04]"
                                : "border-border/20 bg-[#07070a]/20 hover:border-border/50 hover:bg-background/40"
                            )}
                            key={agent.name}
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-xs tracking-wide">
                                  {agent.name}
                                </span>
                                {isInstalled ? (
                                  <span className="rounded border border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0.5 font-bold text-[8px] text-emerald-500/80">
                                    Installed
                                  </span>
                                ) : (
                                  <span className="rounded border border-border/10 bg-muted/10 px-1.5 py-0.5 font-bold text-[8px] text-muted-foreground/60">
                                    Not Installed
                                  </span>
                                )}
                              </div>
                              <p
                                className="mt-0.5 truncate text-[10px] text-muted-foreground/50"
                                title={agent.description}
                              >
                                {agent.description}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              <Button
                                className={cn(
                                  "h-6 px-2.5 font-bold text-[9px] uppercase transition-all duration-200",
                                  isSelected
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "border border-border/30 bg-background/50 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                )}
                                onClick={() => {
                                  if (isInstalled) {
                                    setAutoCommand(agent.command);
                                  } else {
                                    handleCopy(agent.installCommand);
                                  }
                                }}
                                size="sm"
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                              >
                                {isInstalled ? "Launch" : "Install"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </TabsContent>

                    <TabsContent
                      className="mt-2.5 max-h-[140px] space-y-2 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value="installer"
                    >
                      {Array.from(
                        new Set(INSTALLER_TOOLS.map((t) => t.category))
                      ).map((cat) => (
                        <div className="space-y-1" key={cat}>
                          <div className="mt-2 mb-1 pl-1 font-bold text-[8.5px] text-muted-foreground/50 uppercase tracking-wider">
                            {cat}
                          </div>
                          {INSTALLER_TOOLS.filter(
                            (t) => t.category === cat
                          ).map((tool) => {
                            const isInstalled = tool.status === "Installed";
                            const isUpdate = tool.status === "Update Available";
                            return (
                              <div
                                className="group/card flex items-center justify-between rounded-lg border border-border/20 bg-[#07070a]/20 px-3 py-1.5 transition-all duration-300 hover:border-border/50 hover:bg-background/40"
                                key={tool.name}
                              >
                                <div className="min-w-0 flex-1 pr-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground text-xs tracking-wide">
                                      {tool.name}
                                    </span>
                                    {isInstalled && (
                                      <span className="rounded border border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0.5 font-bold text-[8px] text-emerald-500/80">
                                        Installed
                                      </span>
                                    )}
                                    {isUpdate && (
                                      <span className="rounded border border-amber-500/10 bg-amber-500/5 px-1.5 py-0.5 font-bold text-[8px] text-amber-500/80">
                                        Update Available
                                      </span>
                                    )}
                                    {!(isInstalled || isUpdate) && (
                                      <span className="rounded border border-border/10 bg-muted/10 px-1.5 py-0.5 font-bold text-[8px] text-muted-foreground/60">
                                        Not Installed
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className="mt-0.5 truncate text-[10px] text-muted-foreground/50"
                                    title={tool.description}
                                  >
                                    {tool.description}
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5">
                                  <Button
                                    className="h-6 border border-border/30 bg-background/50 px-2.5 font-bold text-[9px] uppercase transition-all duration-200 hover:border-primary/45 hover:bg-primary/5 hover:text-primary"
                                    onClick={() =>
                                      handleCopy(tool.installCommand)
                                    }
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                  >
                                    {tool.action}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Summary Details card */}
              <div className="border-border/10 border-t pt-3">
                <div className="space-y-1.5 rounded-lg border border-border/15 bg-[#07070a]/40 p-3 text-[10.5px] text-muted-foreground/75 shadow-sm">
                  <div className="flex justify-between">
                    <span className="select-none font-bold text-[9.5px] uppercase tracking-wider opacity-60">
                      Layout:
                    </span>
                    <span className="font-bold font-mono text-foreground">
                      {LAYOUTS[terminalCount]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="select-none font-bold text-[9.5px] uppercase tracking-wider opacity-60">
                      Directory:
                    </span>
                    <span
                      className="max-w-[180px] truncate font-bold font-mono text-foreground"
                      title={directory}
                    >
                      {directory.split("\\").pop() || directory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="select-none font-bold text-[9.5px] uppercase tracking-wider opacity-60">
                      Auto Cmd:
                    </span>
                    <span
                      className="max-w-[180px] truncate font-bold font-mono text-foreground"
                      title={autoCommand}
                    >
                      {getCommandLabel(autoCommand)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 border-border/20 border-t bg-[#07070a]/40 p-6 pt-4">
          <Button
            className="h-8.5 border border-border/40 text-xs transition-colors hover:bg-muted/50"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            className="h-8.5 px-6 font-bold text-xs shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] hover:shadow-primary/20"
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
