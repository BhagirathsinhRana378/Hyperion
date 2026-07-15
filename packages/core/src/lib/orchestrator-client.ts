import { safeUUID } from "@workspace/core/lib/uuid";

// biome-ignore lint/performance/noBarrelFile: re-exporting event utilities for terminal compatibility
export { emitEvent, listenToEvent } from "@workspace/core/lib/task-dispatcher";

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// Types matching Rust orchestrator
export interface TaskInput {
  command: string;
  terminalId: string;
}

export interface OrchestrationTask {
  command: string;
  createdAt: number;
  error?: string;
  exitCode?: number;
  id: string;
  maxRetries: number;
  output?: string;
  requestId: string;
  retryCount: number;
  status: string;
  terminalId: string;
  timeoutMs: number;
  updatedAt: number;
  workspaceId: string;
}

export interface TaskResult {
  command: string;
  durationMs: number;
  error?: string;
  exitCode?: number;
  output?: string;
  status: string;
  taskId: string;
  terminalId: string;
}

export interface OrchestrationState {
  iteration: number;
  requestId: string;
  results: TaskResult[];
  status: string;
  tasks: OrchestrationTask[];
}

export interface OrchestrationEvent {
  data: Record<string, unknown>;
  eventType: string;
  requestId: string;
  timestamp: number;
}

// ─── Tauri IPC Client ──────────────────────────────────────────

async function tauriInvoke<T>(
  cmd: string,
  args: Record<string, unknown>
): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

// ─── Web Fallback (in-memory orchestrator for dev without Tauri) ──

class WebOrchestrator {
  private readonly contexts = new Map<
    string,
    { status: string; iteration: number; taskIds: string[] }
  >();
  private readonly tasks = new Map<string, OrchestrationTask>();

  async startOrchestration(
    requestId: string,
    workspaceId: string,
    _plan: string,
    taskInputs: TaskInput[],
    _maxIterations: number
  ): Promise<OrchestrationState> {
    await Promise.resolve();
    const now = Date.now();
    const taskIds: string[] = [];
    const tasks: OrchestrationTask[] = [];

    for (const input of taskInputs) {
      const id = `task-${safeUUID().slice(0, 8)}`;
      const task: OrchestrationTask = {
        id,
        terminalId: input.terminalId,
        workspaceId,
        requestId,
        command: input.command,
        status: "Dispatched",
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
        maxRetries: 3,
        timeoutMs: 3000,
      };
      this.tasks.set(id, task);
      taskIds.push(id);
      tasks.push(task);
    }

    this.contexts.set(requestId, {
      status: "Dispatching",
      iteration: 1,
      taskIds,
    });

    // Dispatch events to terminal panes after a small delay
    setTimeout(async () => {
      const { emitEvent } = await import("@workspace/core/lib/task-dispatcher");
      for (const task of tasks) {
        await emitEvent(`dispatch-task-${task.terminalId}`, task);
      }
    }, 50);

    return {
      requestId,
      status: "Dispatching",
      iteration: 1,
      tasks,
      results: [],
    };
  }

  async acknowledgeTask(taskId: string, _terminalId: string): Promise<void> {
    await Promise.resolve();
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = "Acknowledged";
      task.updatedAt = Date.now();
    }
  }

  async updateTaskStatus(
    taskId: string,
    status: string,
    output?: string,
    error?: string,
    exitCode?: number
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = Date.now();
      if (output) {
        task.output = (task.output || "") + output;
      }
      if (error) {
        task.error = error;
      }
      if (exitCode !== undefined) {
        task.exitCode = exitCode;
      }

      // Check if all tasks for the request are done
      const ctx = this.contexts.get(task.requestId);
      if (
        ctx &&
        (status === "Completed" ||
          status === "Failed" ||
          status === "Cancelled")
      ) {
        const allDone = ctx.taskIds.every((id) => {
          const t = this.tasks.get(id);
          return (
            t &&
            (t.status === "Completed" ||
              t.status === "Failed" ||
              t.status === "Cancelled")
          );
        });
        if (allDone) {
          ctx.status = "WaitingReview";
          // Emit iteration-complete event
          const results = this.getResults(task.requestId);
          const { emitEvent } = await import(
            "@workspace/core/lib/task-dispatcher"
          );
          await emitEvent("orchestration-event", {
            eventType: "iteration_complete",
            requestId: task.requestId,
            timestamp: Date.now(),
            data: { results },
          });
        }
      }
    }
  }

  getResults(requestId: string): TaskResult[] {
    const ctx = this.contexts.get(requestId);
    if (!ctx) {
      return [];
    }
    return ctx.taskIds
      .map((id) => {
        const t = this.tasks.get(id);
        if (!t) {
          return null;
        }
        const res: TaskResult = {
          taskId: t.id,
          terminalId: t.terminalId,
          command: t.command,
          status: t.status,
          output: t.output,
          error: t.error,
          exitCode: t.exitCode,
          durationMs: t.updatedAt - t.createdAt,
        };
        return res;
      })
      .filter((r): r is TaskResult => r !== null);
  }

  async getState(requestId: string): Promise<OrchestrationState> {
    await Promise.resolve();
    const ctx = this.contexts.get(requestId);
    if (!ctx) {
      return {
        requestId,
        status: "Failed",
        iteration: 0,
        tasks: [],
        results: [],
      };
    }
    const tasks = ctx.taskIds
      .map((id) => this.tasks.get(id))
      .filter((t): t is OrchestrationTask => t !== undefined);
    return {
      requestId,
      status: ctx.status,
      iteration: ctx.iteration,
      tasks,
      results: this.getResults(requestId),
    };
  }

  async addIteration(
    requestId: string,
    taskInputs: TaskInput[]
  ): Promise<OrchestrationState> {
    await Promise.resolve();
    const ctx = this.contexts.get(requestId);
    if (!ctx) {
      return {
        requestId,
        status: "Failed",
        iteration: 0,
        tasks: [],
        results: [],
      };
    }
    ctx.iteration += 1;
    ctx.status = "Dispatching";
    const now = Date.now();
    const newTasks: OrchestrationTask[] = [];

    for (const input of taskInputs) {
      const id = `task-${safeUUID().slice(0, 8)}`;
      const task: OrchestrationTask = {
        id,
        terminalId: input.terminalId,
        workspaceId: "",
        requestId,
        command: input.command,
        status: "Dispatched",
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
        maxRetries: 3,
        timeoutMs: 3000,
      };
      this.tasks.set(id, task);
      ctx.taskIds.push(id);
      newTasks.push(task);
    }

    // Dispatch to terminals
    setTimeout(async () => {
      const { emitEvent } = await import("@workspace/core/lib/task-dispatcher");
      for (const task of newTasks) {
        await emitEvent(`dispatch-task-${task.terminalId}`, task);
      }
    }, 50);

    return this.getState(requestId);
  }

  async cancelOrchestration(requestId: string): Promise<void> {
    await Promise.resolve();
    const ctx = this.contexts.get(requestId);
    if (ctx) {
      ctx.status = "Cancelled";
      for (const id of ctx.taskIds) {
        const t = this.tasks.get(id);
        if (t && t.status !== "Completed" && t.status !== "Failed") {
          t.status = "Cancelled";
        }
      }
    }
  }
}

const webOrchestrator = new WebOrchestrator();

// ─── Public API ──────────────────────────────────────────

export function startOrchestration(
  requestId: string,
  workspaceId: string,
  plan: string,
  tasks: TaskInput[],
  maxIterations: number
): Promise<OrchestrationState> {
  if (isTauri) {
    return tauriInvoke<OrchestrationState>("start_orchestration", {
      requestId,
      workspaceId,
      plan,
      tasks,
      maxIterations,
    });
  }
  return webOrchestrator.startOrchestration(
    requestId,
    workspaceId,
    plan,
    tasks,
    maxIterations
  );
}

export function registerTerminal(
  terminalId: string,
  workspaceId: string
): Promise<void> {
  if (isTauri) {
    return tauriInvoke<void>("register_terminal", { terminalId, workspaceId });
  }
  return Promise.resolve();
}

export function unregisterTerminal(terminalId: string): Promise<void> {
  if (isTauri) {
    return tauriInvoke<void>("unregister_terminal", { terminalId });
  }
  return Promise.resolve();
}

export function terminalHeartbeat(terminalId: string): Promise<void> {
  if (isTauri) {
    return tauriInvoke<void>("terminal_heartbeat", { terminalId });
  }
  return Promise.resolve();
}

export function acknowledgeTask(
  taskId: string,
  terminalId: string
): Promise<void> {
  if (isTauri) {
    return tauriInvoke<void>("task_acknowledged", { taskId, terminalId });
  }
  return webOrchestrator.acknowledgeTask(taskId, terminalId);
}

export function updateTaskStatus(
  taskId: string,
  status: string,
  output?: string,
  error?: string,
  exitCode?: number
): Promise<void> {
  if (isTauri) {
    return tauriInvoke<void>("task_status_update", {
      taskId,
      status,
      output,
      error,
      exitCode,
    });
  }
  return webOrchestrator.updateTaskStatus(
    taskId,
    status,
    output,
    error,
    exitCode
  );
}

export function cancelOrchestration(requestId: string): Promise<void> {
  if (isTauri) {
    return tauriInvoke<void>("cancel_orchestration", { requestId });
  }
  return webOrchestrator.cancelOrchestration(requestId);
}

export function addIteration(
  requestId: string,
  tasks: TaskInput[]
): Promise<OrchestrationState> {
  if (isTauri) {
    return tauriInvoke<OrchestrationState>("add_iteration", {
      requestId,
      tasks,
    });
  }
  return webOrchestrator.addIteration(requestId, tasks);
}

export function getOrchestrationState(
  requestId: string
): Promise<OrchestrationState> {
  if (isTauri) {
    return tauriInvoke<OrchestrationState>("get_orchestration_state", {
      requestId,
    });
  }
  return webOrchestrator.getState(requestId);
}

export async function onOrchestrationEvent(
  callback: (event: OrchestrationEvent) => void
): Promise<() => void> {
  const { listenToEvent } = await import("@workspace/core/lib/task-dispatcher");
  return listenToEvent<OrchestrationEvent>("orchestration-event", callback);
}
