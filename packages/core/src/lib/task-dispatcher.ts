export interface Task {
  agentId: string;
  error?: string;
  id: string;
  output?: string;
  parentRequestId: string;
  payload: {
    command: string;
  };
  retryCount: number;
  status:
    | "Queued"
    | "Dispatched"
    | "Acknowledged"
    | "Running"
    | "Streaming"
    | "Completed"
    | "Failed"
    | "Retry";
  terminalId: string;
  timestamp: number;
  workspaceId: string;
}

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function listenToEvent<T>(
  eventName: string,
  handler: (payload: T) => void
): Promise<() => void> {
  if (isTauri) {
    const { listen } = await import("@tauri-apps/api/event");
    const unlisten = await listen<T>(eventName, (event) => {
      handler(event.payload);
    });
    return unlisten;
  }
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<T>;
    handler(customEvent.detail);
  };
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener(eventName, listener);
  };
}

export async function emitEvent<T>(
  eventName: string,
  payload: T
): Promise<void> {
  if (isTauri) {
    const { emit } = await import("@tauri-apps/api/event");
    await emit(eventName, payload);
  } else {
    const event = new CustomEvent(eventName, { detail: payload });
    window.dispatchEvent(event);
  }
}
