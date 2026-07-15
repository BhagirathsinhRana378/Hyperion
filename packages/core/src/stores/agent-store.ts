"use client";

import { safeUUID } from "@workspace/core/lib/uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AgentMessage {
  content: string;
  id: string;
  role: "user" | "agent" | "system";
  timestamp: number;
}

export type TerminalState =
  | "Idle"
  | "Planning"
  | "Waiting"
  | "Dispatched"
  | "Acknowledged"
  | "Running"
  | "Streaming"
  | "Completed"
  | "Failed"
  | "Retrying"
  | "Cancelled";

export interface LogEntry {
  id: string;
  message: string;
  requestId?: string;
  source: "frontend" | "backend" | "ipc" | "api" | "planner" | "terminal";
  timestamp: number;
  type: "info" | "warn" | "error";
}

interface AgentState {
  addLog: (
    source: LogEntry["source"],
    type: LogEntry["type"],
    message: string,
    requestId?: string
  ) => void;
  addMessage: (workspaceId: string, message: AgentMessage) => void;
  apiKey: string;
  availableModels: string[];
  baseUrl: string;
  clearLogs: () => void;
  clearMessages: (workspaceId: string) => void;
  clearProviderConfig: () => void;
  currentRequestId: string;
  health: {
    backend: boolean;
    provider: boolean;
    planner: boolean;
  };
  isOpen: boolean;
  logs: LogEntry[];
  messages: Record<string, AgentMessage[]>; // Mapped by workspace ID
  orchestrationStatus: string;
  provider: string;
  selectedModel: string;
  setApiKey: (key: string) => void;
  setAvailableModels: (models: string[]) => void;
  setBaseUrl: (url: string) => void;
  setCurrentRequestId: (requestId: string) => void;
  setHealth: (key: keyof AgentState["health"], status: boolean) => void;
  setOpen: (isOpen: boolean) => void;
  setOrchestrationStatus: (status: string) => void;
  setProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  setTerminalState: (paneId: string, state: TerminalState) => void;

  // System states for loops and monitoring
  terminalStates: Record<string, TerminalState>;
  toggleOpen: () => void;
  upsertMessage: (workspaceId: string, message: AgentMessage) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      apiKey: "",
      availableModels: [],
      baseUrl: "https://opencode.ai/zen/v1",
      provider: "opencode",
      selectedModel: "",
      setApiKey: (key) => set({ apiKey: key }),
      setAvailableModels: (models) => set({ availableModels: models }),
      setBaseUrl: (url) => set({ baseUrl: url }),
      setProvider: (provider) => set({ provider }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      orchestrationStatus: "idle",
      currentRequestId: "",
      setOrchestrationStatus: (status) => set({ orchestrationStatus: status }),
      setCurrentRequestId: (requestId) => set({ currentRequestId: requestId }),
      isOpen: false,
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (isOpen: boolean) => set({ isOpen }),
      messages: {},
      addMessage: (workspaceId: string, message: AgentMessage) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [workspaceId]: [...(state.messages[workspaceId] || []), message],
          },
        })),
      upsertMessage: (workspaceId: string, message: AgentMessage) =>
        set((state) => {
          const wMsgs = state.messages[workspaceId] || [];
          const existingIdx = wMsgs.findIndex((m) => m.id === message.id);
          let nextMsgs: AgentMessage[];
          if (existingIdx >= 0) {
            nextMsgs = [...wMsgs];
            nextMsgs[existingIdx] = message;
          } else {
            nextMsgs = [...wMsgs, message];
          }
          return {
            messages: {
              ...state.messages,
              [workspaceId]: nextMsgs,
            },
          };
        }),
      clearMessages: (workspaceId: string) =>
        set((state) => {
          const newMessages = { ...state.messages };
          delete newMessages[workspaceId];
          return { messages: newMessages };
        }),
      clearProviderConfig: () =>
        set(() => ({
          apiKey: "",
          baseUrl: "https://opencode.ai/zen/v1",
          provider: "opencode",
          selectedModel: "",
          availableModels: [],
          messages: {},
          logs: [],
          terminalStates: {},
        })),

      terminalStates: {},
      setTerminalState: (paneId, state) =>
        set((prev) => ({
          terminalStates: {
            ...prev.terminalStates,
            [paneId]: state,
          },
        })),
      logs: [],
      addLog: (source, type, message, requestId) => {
        const log: LogEntry = {
          id: safeUUID(),
          timestamp: Date.now(),
          source,
          type,
          message,
          requestId,
        };
        console.log(
          `[${source.toUpperCase()}] [${type.toUpperCase()}] ${message}`
        );
        set((prev) => ({
          logs: [...prev.logs.slice(-499), log], // Cap logs at 500 entries
        }));
      },
      clearLogs: () => set({ logs: [] }),
      health: {
        backend: true,
        provider: true,
        planner: true,
      },
      setHealth: (key, status) =>
        set((prev) => ({
          health: {
            ...prev.health,
            [key]: status,
          },
        })),
    }),
    {
      name: "hyperion-agent-store-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        provider: state.provider,
        selectedModel: state.selectedModel,
        availableModels: state.availableModels,
      }),
    }
  )
);
