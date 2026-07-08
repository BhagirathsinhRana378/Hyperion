"use client";

import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
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
  Plus,
  Terminal,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";

interface WorkspaceNavProps {
  navigate: (path: string) => void;
  onNewWorkspace: () => void;
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

  return (
    <SidebarGroup>
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
        <SidebarMenuItem>
          <SidebarMenuButton
            className="w-full justify-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-4.5 font-semibold text-primary shadow-2xs transition-all hover:bg-primary/10 hover:text-primary"
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
          workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <SidebarMenuItem className="group/item relative" key={ws.id}>
                {isActive && (
                  <div className="absolute top-2 bottom-2 left-0.5 z-20 w-[3px] rounded-r bg-primary" />
                )}

                {renamingId === ws.id ? (
                  <div className="flex h-9.5 w-full items-center gap-2 px-3">
                    <input
                      autoFocus
                      className="flex-1 rounded border border-primary/50 bg-[#111111] px-2 py-1 font-sans text-foreground text-xs outline-none focus:ring-1 focus:ring-primary/20"
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
                        "relative h-9.5 w-full justify-start gap-2 rounded-lg border border-transparent pr-14 pl-3 transition-all group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pr-2",
                        isActive
                          ? "border-border/40 bg-muted/60 font-semibold text-foreground shadow-2xs"
                          : "font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground"
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

                    {/* Actions (shows on hover) */}
                    <div className="absolute top-1/2 right-2 z-30 flex -translate-y-1/2 items-center gap-0.5 bg-gradient-to-l from-[#111111] via-[#111111]/85 to-transparent py-1 pl-4 opacity-0 transition-opacity group-hover/item:opacity-100 group-data-[collapsible=icon]:hidden">
                      <button
                        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setRenamingId(ws.id);
                          setRenameValue(ws.name);
                        }}
                        title="Rename Workspace"
                        type="button"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => handleDelete(ws.id, e)}
                        title="Delete Workspace"
                        type="button"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </>
                )}
              </SidebarMenuItem>
            );
          })
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
