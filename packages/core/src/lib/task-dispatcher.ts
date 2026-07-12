import { safeUUID } from "@workspace/core/lib/uuid";

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

export class TaskDispatcher {
  private readonly workspaceId: string;
  private readonly parentRequestId: string;
  private readonly onTaskUpdate: (task: Task) => void;
  private readonly logFn: (
    message: string,
    type?: "info" | "warn" | "error"
  ) => void;

  constructor(
    workspaceId: string,
    parentRequestId: string,
    onTaskUpdate: (task: Task) => void,
    logFn: (message: string, type?: "info" | "warn" | "error") => void
  ) {
    this.workspaceId = workspaceId;
    this.parentRequestId = parentRequestId;
    this.onTaskUpdate = onTaskUpdate;
    this.logFn = logFn;
  }

  async dispatch(terminalId: string, command: string): Promise<Task> {
    const taskId = `task-${safeUUID().slice(0, 8)}`;
    const task: Task = {
      id: taskId,
      terminalId,
      workspaceId: this.workspaceId,
      agentId: terminalId,
      parentRequestId: this.parentRequestId,
      status: "Queued",
      timestamp: Date.now(),
      retryCount: 0,
      payload: { command },
    };

    this.onTaskUpdate(task);
    this.logFn(
      `Task ${taskId} created for terminal ${terminalId}: "${command}"`,
      "info"
    );

    const success = await this.dispatchWithRetry(task);
    if (!success) {
      task.status = "Failed";
      task.error = "Delivery failed after maximum retry attempts.";
      this.onTaskUpdate(task);
      this.logFn(`Task ${taskId} failed delivery after 3 retries.`, "error");
    }

    return task;
  }

  private async dispatchWithRetry(task: Task): Promise<boolean> {
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      attempt++;
      task.retryCount = attempt - 1;
      task.status = "Dispatched";
      task.timestamp = Date.now();
      this.onTaskUpdate({ ...task });
      this.logFn(
        `Dispatching task ${task.id} (Attempt ${attempt}/${maxAttempts})...`,
        "info"
      );

      let acked = false;
      const ackEventName = `task-ack-${task.id}`;

      // Create a promise to wait for the ACK event
      let resolveAck: (value: boolean) => void;
      const ackPromise = new Promise<boolean>((resolve) => {
        resolveAck = resolve;
      });

      const unlistenPromise = listenToEvent<{ taskId: string }>(
        ackEventName,
        () => {
          acked = true;
          resolveAck(true);
        }
      );

      try {
        if (isTauri) {
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("dispatch_task", { task });
        } else {
          await emitEvent(`dispatch-task-${task.terminalId}`, task);
        }

        // Wait for ACK with timeout
        const timeoutMs = 2000;
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), timeoutMs);
        });

        const result = await Promise.race([ackPromise, timeoutPromise]);
        const unlisten = await unlistenPromise;
        unlisten();

        if (result && acked) {
          task.status = "Acknowledged";
          this.onTaskUpdate({ ...task });
          this.logFn(
            `Task ${task.id} acknowledged by terminal ${task.terminalId}.`,
            "info"
          );
          return true;
        }
        this.logFn(
          `Acknowledgement timeout for task ${task.id} on attempt ${attempt}.`,
          "warn"
        );
      } catch (err: unknown) {
        const unlisten = await unlistenPromise;
        unlisten();
        const errMsg = err instanceof Error ? err.message : String(err);
        this.logFn(
          `IPC dispatch failed for task ${task.id} on attempt ${attempt}: ${errMsg}`,
          "warn"
        );
      }

      task.status = "Retry";
      this.onTaskUpdate({ ...task });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false;
  }

  monitorExecution(task: Task): Promise<Task> {
    if (task.status === "Failed") {
      return Promise.resolve(task);
    }

    return new Promise<Task>((resolve) => {
      const statusEventName = `task-status-${task.id}`;
      let completed = false;
      let unlistenFn: (() => void) | null = null;

      const cleanup = () => {
        completed = true;
        if (unlistenFn) {
          unlistenFn();
        }
      };

      listenToEvent<{
        taskId: string;
        status: Task["status"];
        progress?: number;
        data?: string;
        error?: string;
      }>(statusEventName, (payload) => {
        if (completed) {
          return;
        }
        task.status = payload.status;
        if (payload.data) {
          task.output = (task.output || "") + payload.data;
        }
        if (payload.error) {
          task.error = payload.error;
        }
        this.onTaskUpdate({ ...task });

        if (payload.status === "Running") {
          this.logFn(`Task ${task.id} has started execution.`, "info");
        } else if (payload.status === "Completed") {
          this.logFn(`Task ${task.id} completed successfully.`, "info");
          cleanup();
          resolve(task);
        } else if (payload.status === "Failed") {
          this.logFn(
            `Task ${task.id} execution failed: ${payload.error || "Unknown error"}`,
            "error"
          );
          cleanup();
          resolve(task);
        }
      })
        .then((unlisten) => {
          unlistenFn = unlisten;
          if (completed) {
            unlisten();
          }
        })
        .catch((err) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.logFn(`Failed to set up execution listener: ${errMsg}`, "error");
          resolve(task);
        });
    });
  }
}
