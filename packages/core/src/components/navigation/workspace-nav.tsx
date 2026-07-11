"use client";

import { useMounted } from "@workspace/core/hooks/use-mounted";
import {
  useWorkspaceStore,
  type Workspace,
} from "@workspace/core/stores/workspace-store";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import {
  ChevronRight,
  Edit2,
  LayoutGrid,
  Pin,
  PinOff,
  Plus,
  Terminal,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

interface WorkspaceNavProps {
  navigate: (path: string) => void;
  onNewWorkspace: () => void;
}

interface WorkspaceItemActionsProps {
  isPinned?: boolean;
  onDeleteClick: (e: React.MouseEvent) => void;
  onPinToggle: (e: React.MouseEvent) => void;
  onRenameClick: (e: React.MouseEvent) => void;
}

function WorkspaceItemActions({
  isPinned,
  onPinToggle,
  onRenameClick,
  onDeleteClick,
}: WorkspaceItemActionsProps) {
  return (
    <div className="pointer-events-none absolute top-1/2 right-3 z-30 flex translate-x-1 -translate-y-1/2 items-center gap-0.5 rounded-md border border-border/20 bg-background/90 px-1 py-0.5 opacity-0 shadow-lg backdrop-blur-xs transition-all duration-200 group-hover/item:pointer-events-auto group-hover/item:translate-x-0 group-hover/item:opacity-100 group-data-[collapsible=icon]:hidden">
      <button
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onPinToggle}
        title={isPinned ? "Unpin Workspace" : "Pin Workspace"}
        type="button"
      >
        {isPinned ? (
          <PinOff className="size-3 text-primary" />
        ) : (
          <Pin className="size-3" />
        )}
      </button>
      <button
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onRenameClick}
        title="Rename Workspace"
        type="button"
      >
        <Edit2 className="size-3" />
      </button>
      <button
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        onClick={onDeleteClick}
        title="Delete Workspace"
        type="button"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
}

export function WorkspaceNav({ navigate, onNewWorkspace }: WorkspaceNavProps) {
  const mounted = useMounted();
  const { isMobile, setOpenMobile } = useSidebar();
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    deleteWorkspace,
    renameWorkspace,
    togglePinWorkspace,
  } = useWorkspaceStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleSelect = useCallback(
    (id: string) => {
      setActiveWorkspace(id);
      if (isMobile) {
        setOpenMobile(false);
      }
      navigate("/workspace");
    },
    [isMobile, setOpenMobile, navigate, setActiveWorkspace]
  );

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      deleteWorkspace(id);
    },
    [deleteWorkspace]
  );

  const handleRenameSave = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      renameWorkspace(id, trimmed);
    }
    setRenamingId(null);
  };

  if (!mounted) {
    return null;
  }

  const pinnedWorkspaces = workspaces.filter((w) => w.isPinned);
  const regularWorkspaces = workspaces.filter((w) => !w.isPinned);

  const renderWorkspaceItem = (ws: Workspace) => {
    const isActive = ws.id === activeWorkspaceId;
    return (
      <SidebarMenuItem className="group/item relative px-1.5" key={ws.id}>
        {isActive && (
          <motion.div
            className="absolute top-1.5 bottom-1.5 left-0 z-20 w-[2.5px] rounded-full bg-primary shadow-[0_0_6px_var(--primary)]"
            layoutId="activeWorkspaceIndicator"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {renamingId === ws.id ? (
          <div className="flex h-9.5 w-full items-center gap-2 px-3">
            <input
              autoFocus
              className="flex-1 rounded border border-primary/50 bg-background px-2 py-1 font-sans text-foreground text-xs outline-none focus:ring-1 focus:ring-primary/20"
              onBlur={() => handleRenameSave(ws.id)}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSave(ws.id);
                } else if (e.key === "Escape") {
                  setRenamingId(null);
                }
              }}
              value={renameValue}
            />
          </div>
        ) : (
          <>
            <SidebarMenuButton
              className={cn(
                "relative h-9 w-full justify-start gap-2.5 rounded-lg border transition-all duration-200 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pr-2",
                isActive
                  ? "border-primary/15 bg-primary/[0.04] font-semibold text-foreground shadow-primary/[0.02] shadow-sm backdrop-blur-xs"
                  : "border-transparent font-medium text-muted-foreground hover:bg-muted/15 hover:text-foreground"
              )}
              isActive={isActive}
              onClick={() => handleSelect(ws.id)}
            >
              <ChevronRight
                className={cn(
                  "size-3 shrink-0 transition-transform group-data-[collapsible=icon]:hidden",
                  isActive
                    ? "rotate-90 text-primary"
                    : "text-muted-foreground/45 group-hover/item:text-muted-foreground/75"
                )}
              />
              <Terminal
                className={cn(
                  "size-3.5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground/50"
                )}
              />
              <span className="truncate pr-1 text-sm group-data-[collapsible=icon]:hidden">
                {ws.name}
              </span>

              {/* Terminal count pill */}
              <span
                className={cn(
                  "absolute right-2 scale-90 rounded border px-1.5 py-0.5 font-bold font-mono text-[9px] transition-opacity group-hover/item:opacity-0 group-data-[collapsible=icon]:hidden",
                  isActive
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border/40 bg-muted text-muted-foreground/60 opacity-70"
                )}
              >
                {ws.terminalCount}
              </span>
            </SidebarMenuButton>

            <WorkspaceItemActions
              isPinned={ws.isPinned}
              onDeleteClick={(e) => handleDelete(ws.id, e)}
              onPinToggle={(e) => {
                e.stopPropagation();
                e.preventDefault();
                togglePinWorkspace(ws.id);
              }}
              onRenameClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setRenamingId(ws.id);
                setRenameValue(ws.name);
              }}
            />
          </>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarGroup className="px-2">
      <div className="flex items-center justify-between px-2 py-1.5 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="font-bold text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          Workspaces
        </SidebarGroupLabel>
        <button
          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onNewWorkspace}
          title="New Workspace"
          type="button"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <SidebarMenu className="mt-1 gap-1">
        <SidebarMenuItem className="px-1.5">
          <SidebarMenuButton
            className="w-full justify-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-4.5 font-semibold text-primary shadow-2xs transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
            onClick={onNewWorkspace}
          >
            <div className="flex size-4.5 items-center justify-center rounded bg-primary/10">
              <Plus className="size-3.5" />
            </div>
            <span className="font-bold text-[10px] uppercase tracking-widest group-data-[collapsible=icon]:hidden">
              New Workspace
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center group-data-[collapsible=icon]:hidden">
            <LayoutGrid className="mb-2 size-6 text-muted-foreground/40" />
            <p className="text-[11px] text-muted-foreground/60 leading-normal">
              No workspaces yet. Create one to begin.
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            {pinnedWorkspaces.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 font-bold text-[9px] text-muted-foreground/40 uppercase tracking-widest group-data-[collapsible=icon]:hidden">
                  Pinned
                </div>
                {pinnedWorkspaces.map(renderWorkspaceItem)}
              </div>
            )}

            {regularWorkspaces.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 font-bold text-[9px] text-muted-foreground/40 uppercase tracking-widest group-data-[collapsible=icon]:hidden">
                  Active
                </div>
                {regularWorkspaces.map(renderWorkspaceItem)}
              </div>
            )}
          </div>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
