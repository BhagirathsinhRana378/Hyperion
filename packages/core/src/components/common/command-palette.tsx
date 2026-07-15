"use client";

import { NewWorkspaceDialog } from "@workspace/core/components/common/new-workspace-dialog";
import { hotkeys } from "@workspace/core/config/hotkeys";
import { useDrawerHistory } from "@workspace/core/hooks/use-drawer-history";
import { formatHotkeyDisplay } from "@workspace/core/lib/utils";
import { useCommandPaletteStore } from "@workspace/core/stores/command-palette-store";
import { useHotkeysDialogStore } from "@workspace/core/stores/hotkeys-store";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import { useTranslations } from "@workspace/i18n";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@workspace/ui/components/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { Kbd } from "@workspace/ui/components/kbd";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";
import {
  CornerDownLeftIcon,
  Keyboard,
  MoveDown,
  MoveUp,
  PanelLeft,
  Plus,
  Settings,
  Terminal,
} from "lucide-react";
import React, { useCallback, useState } from "react";

function CommandMenuItem({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  "data-selected"?: string;
  "aria-selected"?: string;
}) {
  return (
    <CommandItem
      className={cn(
        "h-9 rounded-md border border-transparent px-3! font-medium transition-all duration-100 ease-out data-[selected=true]:scale-[1.008] data-[selected=true]:border-input data-[selected=true]:bg-input/50 data-[selected=true]:shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

export function CommandPalette({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const t = useTranslations("CommandPalette");
  const { isOpen, close } = useCommandPaletteStore();
  useDrawerHistory(isOpen, close);
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const toggleHotkeysDialog = useHotkeysDialogStore((s) => s.toggle);

  // Workspaces access
  const { workspaces, activeWorkspaceId, setActiveWorkspace } =
    useWorkspaceStore();
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);

  const runCommand = useCallback(
    (command: () => unknown) => {
      close();
      setTimeout(() => {
        command();
      }, 300);
    },
    [close]
  );

  const getKeysDisplay = (id: string) => {
    const hk = hotkeys.find((h) => h.id === id);
    if (!hk) {
      return null;
    }
    const keys = formatHotkeyDisplay(hk.keys);
    const isSequence = hk.keys.includes(">");
    return (
      <CommandShortcut className="ml-auto hidden items-center gap-1 md:flex">
        {keys.map((key, i) => (
          <React.Fragment key={key}>
            <Kbd>{key}</Kbd>
            {isSequence && i < keys.length - 1 && (
              <span className="mx-1.5 font-mono text-[10px] text-muted-foreground opacity-70">
                {t("then")}
              </span>
            )}
          </React.Fragment>
        ))}
      </CommandShortcut>
    );
  };

  const groupClasses =
    "p-0! **:[[cmdk-group-heading]]:scroll-mt-16 **:[[cmdk-group-heading]]:p-3! **:[[cmdk-group-heading]]:pb-1!";

  const paletteContent = (
    <>
      <Command
        className={cn(
          "rounded-none bg-transparent p-2",
          "**:data-[slot=command-input-wrapper]:p-0!",
          "**:data-[slot=command-input]:h-9! **:data-[slot=command-input]:py-0",
          "**:data-[slot=input-group]:h-9! **:data-[slot=input-group]:rounded-md **:data-[slot=input-group]:border-input **:data-[slot=input-group]:bg-input/50",
          isMobile && "h-full"
        )}
      >
        <CommandInput
          autoFocus={true}
          placeholder="Type a command or search workspaces..."
        />
        <CommandList
          className={cn(
            "no-scrollbar scroll-pt-2 scroll-pb-1.5",
            isMobile ? "max-h-none min-h-0 flex-1" : "min-h-80"
          )}
        >
          <CommandEmpty className="py-12 text-center text-muted-foreground text-sm">
            {t("noResults")}
          </CommandEmpty>

          <CommandGroup className={groupClasses} heading="Workspaces">
            <CommandMenuItem
              onSelect={() => {
                close();
                setNewWorkspaceOpen(true);
              }}
            >
              <Plus className="mr-2 size-4 text-primary" />
              <span>Create New Workspace</span>
              {getKeysDisplay("new-workspace")}
            </CommandMenuItem>

            {workspaces.map((ws) => (
              <CommandMenuItem
                key={ws.id}
                onSelect={() =>
                  runCommand(() => {
                    setActiveWorkspace(ws.id);
                    navigate("/workspace");
                  })
                }
              >
                <Terminal
                  className={cn(
                    "mr-2 size-4",
                    ws.id === activeWorkspaceId
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span>{ws.name}</span>
                {ws.id === activeWorkspaceId && (
                  <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 font-bold text-[10px] text-primary uppercase tracking-wider">
                    Active
                  </span>
                )}
              </CommandMenuItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup className={groupClasses} heading={t("general")}>
            {!isMobile && (
              <CommandMenuItem
                onSelect={() => runCommand(() => toggleSidebar())}
              >
                <PanelLeft />
                <span>{t("toggleSidebar")}</span>
                {getKeysDisplay("toggle-sidebar")}
              </CommandMenuItem>
            )}

            {!isMobile && (
              <CommandMenuItem
                onSelect={() => runCommand(() => toggleHotkeysDialog())}
              >
                <Keyboard />
                <span>{t("showHotkeys")}</span>
                {getKeysDisplay("show-hotkeys")}
              </CommandMenuItem>
            )}

            <CommandMenuItem
              onSelect={() => runCommand(() => navigate("/settings"))}
            >
              <Settings />
              <span>Settings</span>
              {getKeysDisplay("go-settings")}
            </CommandMenuItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <div className="absolute inset-x-0 bottom-0 z-20 hidden h-10 items-center justify-between rounded-b-xl border-border border-t bg-muted/50 px-4 font-medium text-muted-foreground text-xs md:flex">
        <div className="flex items-center gap-2">
          <Kbd>
            <MoveUp />
          </Kbd>
          <Kbd>
            <MoveDown />
          </Kbd>
          <span>{t("navigate")}</span>
          <Kbd>
            <CornerDownLeftIcon />
          </Kbd>
          <span>{t("openOrSelect")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Esc</Kbd>
          <span>{t("close")}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Drawer onOpenChange={(open) => !open && close()} open={isOpen}>
          <DrawerContent
            className="h-[96dvh] overflow-hidden"
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>{t("commandPalette")}</DrawerTitle>
              <DrawerDescription>{t("search")}</DrawerDescription>
            </DrawerHeader>
            {paletteContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog onOpenChange={(open) => !open && close()} open={isOpen}>
          <DialogContent
            className="top-[15%] translate-y-0 overflow-hidden rounded-xl border-none bg-background bg-clip-padding p-0 pb-10 shadow-2xl ring-4 ring-border/80 sm:max-w-lg"
            showCloseButton={false}
          >
            <DialogHeader className="sr-only">
              <DialogTitle>{t("commandPalette")}</DialogTitle>
              <DialogDescription>{t("search")}</DialogDescription>
            </DialogHeader>
            {paletteContent}
          </DialogContent>
        </Dialog>
      )}
      <NewWorkspaceDialog
        onCreated={() => navigate("/workspace")}
        onOpenChange={setNewWorkspaceOpen}
        open={newWorkspaceOpen}
      />
    </>
  );
}
