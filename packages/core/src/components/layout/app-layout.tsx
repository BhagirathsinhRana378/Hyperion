"use client";

import { CommandPalette } from "@workspace/core/components/common/command-palette";
import { HotkeysDialog } from "@workspace/core/components/common/hotkeys-dialog";
import { ProfileDrawer } from "@workspace/core/components/common/profile-drawer";
import { AppHeader } from "@workspace/core/components/layout/app-header";
import { AppSidebar } from "@workspace/core/components/layout/app-sidebar";
import { PanelManager } from "@workspace/core/components/panels/panel-manager";
import { navigationData } from "@workspace/core/config/navigation";
import { useAppHotkeys } from "@workspace/core/hooks/use-app-hotkeys";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { Toaster } from "@workspace/ui/components/sonner";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import type { ComponentType, ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
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

function HotkeysRegistrar({ navigate }: { navigate: (path: string) => void }) {
  useAppHotkeys({ navigate });
  return null;
}

export function AppLayout({
  children,
  pathname,
  navigate,
  LinkComponent,
}: AppLayoutProps) {
  return (

      <TooltipProvider>
        <SidebarProvider className="h-screen bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <HotkeysRegistrar navigate={navigate} />
          <AppSidebar
            LinkComponent={LinkComponent}
            navigate={navigate}
            pathname={pathname}
          />
          <SidebarInset className="flex min-w-0 flex-col bg-background">
            <AppHeader LinkComponent={LinkComponent} pathname={pathname} />
            <main className="flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
            <Toaster />
          </SidebarInset>
          <HotkeysDialog />
          <CommandPalette navigate={navigate} />
          <ProfileDrawer user={navigationData.user} />
          <PanelManager />
        </SidebarProvider>
      </TooltipProvider>

  );
}
