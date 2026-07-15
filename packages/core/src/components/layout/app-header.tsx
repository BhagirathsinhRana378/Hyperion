"use client";

import { NotificationCenter } from "@workspace/core/components/common/notification-center";
import { formatHotkeyDisplay } from "@workspace/core/lib/utils";
import { useAgentStore } from "@workspace/core/stores/agent-store";
import { useCommandPaletteStore } from "@workspace/core/stores/command-palette-store";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb";
import { Button } from "@workspace/ui/components/button";
import { Kbd } from "@workspace/ui/components/kbd";
import { ChevronRight, Search, Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import { toast } from "sonner";

interface AppHeaderProps {
  LinkComponent?:
    | ComponentType<{
        href: string;
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
      }>
    | "a";
  pathname: string;
}

export function AppHeader({ pathname, LinkComponent = "a" }: AppHeaderProps) {
  const toggleCommandPalette = useCommandPaletteStore((s) => s.toggle);
  const toggleAgent = useAgentStore((s) => s.toggleOpen);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const isSettings = pathname === "/settings";
  const hotkeyDisplay = formatHotkeyDisplay("mod+k");

  const handleToggleAgent = () => {
    if (!activeWorkspaceId) {
      toast.error("Create a workspace first to use the Main Agent");
      return;
    }
    toggleAgent();
  };

  return (
    <header className="flex h-10.5 shrink-0 items-center justify-between border-border/40 border-b bg-background/95 px-4 backdrop-blur-md transition-[width,height] ease-linear md:px-6">
      {/* Left section: breadcrumbs */}
      <div className="flex items-center gap-2">
        <Breadcrumb>
          <BreadcrumbList className="flex items-center gap-1.5 font-semibold text-muted-foreground/90 text-xs">
            <BreadcrumbItem>
              {isSettings ? (
                <LinkComponent
                  className="font-bold text-micro-uppercase tracking-wider transition-colors hover:text-foreground"
                  href="/workspace"
                >
                  Workspaces
                </LinkComponent>
              ) : (
                <span className="font-bold text-micro-uppercase text-muted-foreground/60 tracking-wider">
                  Workspaces
                </span>
              )}
            </BreadcrumbItem>

            {isSettings && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/45" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-bold text-micro-uppercase text-foreground tracking-wider">
                    Settings
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}

            {!isSettings && activeWorkspace && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/45" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-sans font-semibold text-foreground text-sm tracking-tight">
                    {activeWorkspace.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Middle section: centered Raycast-style search bar */}
      <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <button
          className="flex w-68 items-center justify-between rounded-lg border border-border/45 bg-muted/20 px-3 py-1 text-muted-foreground text-xs shadow-2xs transition-all hover:border-border/80 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
          onClick={toggleCommandPalette}
          type="button"
        >
          <span className="flex items-center gap-2">
            <Search className="size-3.5 text-muted-foreground/75" />
            <span>Search or command...</span>
          </span>
          <span className="flex items-center gap-0.5 opacity-80">
            {hotkeyDisplay.map((key) => (
              <Kbd
                className="h-4.5 min-w-4 px-1 font-bold text-[9px]"
                key={key}
              >
                {key}
              </Kbd>
            ))}
          </span>
        </button>
      </div>

      {/* Right section: tools, settings, alerts */}
      <div className="flex items-center gap-2">
        <Button
          className="flex rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground md:hidden"
          onClick={toggleCommandPalette}
          size="icon"
          variant="ghost"
        >
          <Search className="size-4" />
        </Button>
        <Button
          className="flex rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:text-primary"
          onClick={handleToggleAgent}
          size="icon"
          title="Toggle Main Agent"
          variant="ghost"
        >
          <Sparkles className="size-4" />
        </Button>
        <NotificationCenter />
      </div>
    </header>
  );
}
