"use client";

import { NewWorkspaceDialog } from "@workspace/core/components/common/new-workspace-dialog";
import { UserNav } from "@workspace/core/components/navigation/user-nav";
import { WorkspaceNav } from "@workspace/core/components/navigation/workspace-nav";
import { navigationData } from "@workspace/core/config/navigation";
import { siteConfig } from "@workspace/core/config/site";
import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useSidebarStore } from "@workspace/core/stores/sidebar-store";
import { Logo } from "@workspace/ui/components/landing/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Settings } from "lucide-react";
import type * as React from "react";
import type { ComponentType } from "react";
import { useState } from "react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  LinkComponent?:
    | ComponentType<{
        href: string;
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
      }>
    | "a";
  navigate: (path: string) => void;
  pathname: string;
}

export function AppSidebar({
  pathname,
  navigate,
  LinkComponent = "a",
  ...props
}: AppSidebarProps) {
  const { variant } = useSidebarStore();
  const mounted = useMounted();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Sidebar collapsible="icon" variant={variant} {...props}>
        <SidebarHeader className="flex flex-row items-center justify-between border-border/40 border-b px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <SidebarMenu className="flex-1 group-data-[collapsible=icon]:hidden">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild={true}
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <LinkComponent
                  href="/workspace"
                  onClick={() => navigate("/workspace")}
                >
                  <Logo className="!size-5" />
                  <span className="font-semibold text-base tracking-tight">
                    {siteConfig.name}
                  </span>
                </LinkComponent>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger className="size-8" />
        </SidebarHeader>
        <SidebarContent className="py-2">
          <WorkspaceNav
            navigate={navigate}
            onNewWorkspace={() => setDialogOpen(true)}
          />
        </SidebarContent>
        <SidebarFooter className="border-border/40 border-t p-2">
          <div className="flex items-center justify-between gap-1.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
            <div className="w-full min-w-0 flex-1">
              <UserNav user={navigationData.user} />
            </div>
            <SidebarMenu className="w-auto shrink-0 group-data-[collapsible=icon]:hidden">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild={true}
                  className="flex size-9 items-center justify-center rounded-lg border border-border/40 bg-background/25 p-0 hover:bg-accent/40"
                  isActive={pathname === "/settings"}
                  size="sm"
                  tooltip="Settings"
                >
                  <LinkComponent
                    href="/settings"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="size-4 text-muted-foreground/80 group-hover:text-foreground" />
                    <span className="sr-only">Settings</span>
                  </LinkComponent>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
      <NewWorkspaceDialog
        onCreated={() => navigate("/workspace")}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />
    </>
  );
}
