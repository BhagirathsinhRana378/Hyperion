export interface HotkeyDefinition {
  category: "navigation" | "general";
  id: string;
  keys: string;
  translationKey: string;
}

export const hotkeys: HotkeyDefinition[] = [
  {
    id: "command-palette",
    keys: "mod+k",
    translationKey: "commandPalette",
    category: "general",
  },
  {
    id: "toggle-sidebar",
    keys: "mod+b",
    translationKey: "toggleSidebar",
    category: "general",
  },
  {
    id: "new-workspace",
    keys: "mod+n",
    translationKey: "newWorkspace",
    category: "general",
  },
  {
    id: "go-settings",
    keys: "g>s",
    translationKey: "goSettings",
    category: "navigation",
  },
  {
    id: "show-hotkeys",
    keys: "?",
    translationKey: "showHotkeys",
    category: "general",
  },
  {
    id: "workspace-1",
    keys: "ctrl+1",
    translationKey: "workspace1",
    category: "navigation",
  },
  {
    id: "workspace-2",
    keys: "ctrl+2",
    translationKey: "workspace2",
    category: "navigation",
  },
  {
    id: "workspace-3",
    keys: "ctrl+3",
    translationKey: "workspace3",
    category: "navigation",
  },
  {
    id: "workspace-4",
    keys: "ctrl+4",
    translationKey: "workspace4",
    category: "navigation",
  },
  {
    id: "workspace-5",
    keys: "ctrl+5",
    translationKey: "workspace5",
    category: "navigation",
  },
  {
    id: "workspace-6",
    keys: "ctrl+6",
    translationKey: "workspace6",
    category: "navigation",
  },
  {
    id: "workspace-7",
    keys: "ctrl+7",
    translationKey: "workspace7",
    category: "navigation",
  },
  {
    id: "workspace-8",
    keys: "ctrl+8",
    translationKey: "workspace8",
    category: "navigation",
  },
  {
    id: "workspace-9",
    keys: "ctrl+9",
    translationKey: "workspace9",
    category: "navigation",
  },
];
