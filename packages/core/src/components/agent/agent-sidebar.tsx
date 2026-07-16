"use client";

import {
  addIteration,
  cancelOrchestration,
  type OrchestrationEvent,
  onOrchestrationEvent,
  startOrchestration,
  type TaskInput,
  type TaskResult,
} from "@workspace/core/lib/orchestrator-client";
import { ProviderFactory } from "@workspace/core/lib/providers/provider-factory";

import { safeUUID } from "@workspace/core/lib/uuid";
import {
  type AgentMessage,
  type TerminalState,
  useAgentStore,
} from "@workspace/core/stores/agent-store";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import {
  Check,
  Edit2,
  HelpCircle,
  Loader2,
  Play,
  Plus,
  Send,
  Sparkles,
  Square,
  TerminalSquare,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

const MAX_ITERATIONS = 20;

function buildPlanningSystemPrompt(
  panes: { id: string; title: string; name?: string }[]
): string {
  const agentList = panes
    .map((p) => `  - ${p.name || p.title} (${p.title}) — id="${p.id}"`)
    .join("\n");

  return `You are the Hyperion Orchestrator Planner. Your task is to analyze the user request and generate a structured execution plan.
You have ${panes.length} terminal agents:
${agentList}

Important: You can ask the user for input mid-execution when you need approval or clarification.
When a command is potentially dangerous (rm -rf, sudo, format, etc.), pause and ask the user for approval before proceeding.
To ask the user a question mid-execution, include "ASK_USER: <your question>" on its own line in the plan or review.
When the user responds, their answer will be fed back to you so you can continue.

Generate a clear, bulleted plan showing which terminal agent will perform what actions. Break down the tasks logically and ensure there are no overlapping tasks. Do not call any tools.`;
}

async function parsePlanToTasks(
  planText: string,
  targetedPanes: { id: string; title: string; name?: string }[],
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>
): Promise<Array<{ terminalId: string; command: string }>> {
  const parserPrompt = `You are a structured task parser. Your job is to extract executable terminal commands from a natural language execution plan.
You have access to the following terminals: ${targetedPanes.map((p) => `"${p.name || p.title}" (id: "${p.id}")`).join(", ")}.

Convert the plan into a JSON array of task objects. Each object must have:
- terminalId: the ID of the terminal to run the command on (MUST match one of the IDs provided above)
- command: the exact shell command to execute

Example output:
[
  {"terminalId": "terminal-1", "command": "pnpm install"},
  {"terminalId": "terminal-2", "command": "git status"}
]

Execution Plan to Parse:
"""
${planText}
"""

Respond ONLY with the JSON array, no markdown formatting (do not wrap in \`\`\`json), no extra text.`;

  const parseResult = await providerInstance.sendPrompt([
    { role: "user", content: parserPrompt },
  ]);

  let cleanedContent = parseResult.content.trim();
  if (cleanedContent.startsWith("```json")) {
    cleanedContent = cleanedContent.slice(7);
  }
  if (cleanedContent.startsWith("```")) {
    cleanedContent = cleanedContent.slice(3);
  }
  if (cleanedContent.endsWith("```")) {
    cleanedContent = cleanedContent.slice(0, cleanedContent.length - 3);
  }
  cleanedContent = cleanedContent.trim();

  return JSON.parse(cleanedContent);
}

async function reviewExecutionResults(
  planText: string,
  taskResultsSummary: string,
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>
): Promise<{
  status: "COMPLETED" | "IMPROVE";
  summary?: string;
  explanation?: string;
  nextPlan?: string;
}> {
  const reviewerPrompt = `You are the Hyperion Orchestrator Reviewer. Your task is to evaluate the results of the executed tasks against the user's original goal.

Original Goal: "${planText}"
Executed Tasks and their Outputs:
${taskResultsSummary}

Determine if the goal is fully achieved.
If the goal is achieved:
Respond with a JSON object:
{
  "status": "COMPLETED",
  "summary": "A detailed explanation of what was achieved and the final merged outputs."
}

If the goal is NOT achieved or needs improvements/corrections:
Respond with a JSON object:
{
  "status": "IMPROVE",
  "explanation": "Why the goal is not met yet and what needs to be fixed.",
  "nextPlan": "A new execution plan with the specific commands to run on the terminals to fix or proceed."
}

Respond ONLY with the JSON object, no markdown formatting, no extra text.`;

  const reviewResult = await providerInstance.sendPrompt([
    { role: "user", content: reviewerPrompt },
  ]);

  let cleanReview = reviewResult.content.trim();
  if (cleanReview.startsWith("```json")) {
    cleanReview = cleanReview.slice(7);
  }
  if (cleanReview.startsWith("```")) {
    cleanReview = cleanReview.slice(3);
  }
  if (cleanReview.endsWith("```")) {
    cleanReview = cleanReview.slice(0, cleanReview.length - 3);
  }
  cleanReview = cleanReview.trim();

  return JSON.parse(cleanReview);
}

async function parseNextPlanToTasks(
  nextPlan: string,
  targetedPanes: { id: string; title: string; name?: string }[],
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>
): Promise<Array<{ terminalId: string; command: string }>> {
  const nextParserPrompt = `You are a structured task parser. Extract the terminal commands from this plan:
"${nextPlan}"

Available terminals: ${targetedPanes.map((p) => `"${p.name || p.title}" (id: "${p.id}")`).join(", ")}.

Respond ONLY with the JSON array of task objects (terminalId, command).`;

  const nextParseRes = await providerInstance.sendPrompt([
    { role: "user", content: nextParserPrompt },
  ]);
  let nextClean = nextParseRes.content.trim();
  if (nextClean.startsWith("```json")) {
    nextClean = nextClean.slice(7);
  }
  if (nextClean.startsWith("```")) {
    nextClean = nextClean.slice(3);
  }
  if (nextClean.endsWith("```")) {
    nextClean = nextClean.slice(0, nextClean.length - 3);
  }
  nextClean = nextClean.trim();

  return JSON.parse(nextClean);
}

function handleOrchestrationEvent(
  event: OrchestrationEvent,
  setTerminalState: (id: string, s: TerminalState) => void,
  resolve: (results: TaskResult[]) => void,
  reject: (err: Error) => void,
  timeoutId: NodeJS.Timeout,
  cleanup: () => void
) {
  const tid = event.data.terminalId as string | undefined;

  switch (event.eventType) {
    case "task_dispatched":
      if (tid) {
        setTerminalState(tid, "Dispatched");
      }
      break;
    case "task_acknowledged":
      if (tid) {
        setTerminalState(tid, "Acknowledged");
      }
      break;
    case "task_running":
      if (tid) {
        setTerminalState(tid, "Running");
      }
      break;
    case "task_streaming":
      if (tid) {
        setTerminalState(tid, "Streaming");
      }
      break;
    case "task_completed":
      if (tid) {
        setTerminalState(tid, "Completed");
      }
      break;
    case "task_failed":
      if (tid) {
        setTerminalState(tid, "Failed");
      }
      break;
    case "task_retrying":
      if (tid) {
        setTerminalState(tid, "Retrying");
      }
      break;
    case "iteration_complete":
      clearTimeout(timeoutId);
      cleanup();
      resolve((event.data.results || []) as TaskResult[]);
      break;
    case "orchestration_failed":
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error((event.data.error as string) || "Orchestration failed"));
      break;
    case "orchestration_cancelled":
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error("Orchestration cancelled"));
      break;
    default:
      break;
  }
}

function waitForIterationComplete(
  _requestId: string,
  setTerminalState: (id: string, s: TerminalState) => void
): Promise<TaskResult[]> {
  return new Promise<TaskResult[]>((resolve, reject) => {
    let unlistenFn: (() => void) | null = null;
    let resolved = false;

    const cleanup = () => {
      resolved = true;
      if (unlistenFn) {
        unlistenFn();
      }
    };

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        cleanup();
        reject(new Error("Iteration timed out after 90 seconds"));
      }
    }, 90_000);

    onOrchestrationEvent((event: OrchestrationEvent) => {
      if (resolved) {
        return;
      }
      handleOrchestrationEvent(
        event,
        setTerminalState,
        resolve,
        reject,
        timeoutId,
        cleanup
      );
    }).then((unsub) => {
      unlistenFn = unsub;
      if (resolved) {
        unsub();
      }
    });
  });
}

async function executeSingleIteration(
  requestId: string,
  currentIteration: number,
  maxLoops: number,
  approvedPlan: string,
  currentPlan: string,
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>,
  targetedPanes: { id: string; title: string; name?: string }[],
  workspaceId: string,
  execMsgId: string,
  setTerminalState: (id: string, s: TerminalState) => void,
  logFn: (msg: string, type?: "info" | "warn" | "error") => void,
  // biome-ignore lint/suspicious/noExplicitAny: matching store type
  upsertMessage: (workspaceId: string, msg: any) => void,
  askForPermissionFn: (
    question: string,
    context: string,
    wsId: string
  ) => Promise<string>,
  addMessageFn: (wsId: string, msg: AgentMessage) => void
): Promise<{ completed: boolean; newTasks?: TaskInput[] }> {
  logFn(`Waiting for iteration ${currentIteration} results...`);
  upsertMessage(workspaceId, {
    id: execMsgId,
    role: "agent",
    content: `⏳ **Iteration ${currentIteration}/${maxLoops}** — Executing tasks...`,
    timestamp: Date.now(),
  });

  // Wait for all tasks to complete
  const results = await waitForIterationComplete(requestId, setTerminalState);
  logFn(`Iteration ${currentIteration} complete. Reviewing results...`);

  // Build results summary for LLM review
  const taskResultsSummary = results
    .map(
      (r) =>
        `---\nTerminal: ${r.terminalId}\nCommand: ${r.command}\nStatus: ${r.status}\nError: ${r.error || "None"}\nOutput:\n${r.output || "[No output]"}\n`
    )
    .join("\n");

  upsertMessage(workspaceId, {
    id: execMsgId,
    role: "agent",
    content: `��� **Reviewing iteration ${currentIteration} results...**`,
    timestamp: Date.now(),
  });

  // LLM review
  const reviewObj = await reviewExecutionResults(
    approvedPlan || currentPlan,
    taskResultsSummary,
    providerInstance
  );

  // If LLM says "IMPROVE" and includes ASK_USER, route to interactive prompt
  if (
    reviewObj.status === "IMPROVE" &&
    reviewObj.nextPlan?.includes("ASK_USER:")
  ) {
    const question = reviewObj.nextPlan
      .split("ASK_USER:")[1]
      ?.split("\n")[0]
      ?.trim();
    if (question) {
      const userAnswer = await askForPermissionFn(
        question,
        `Context: ${currentPlan}\n\nCurrent results:\n${taskResultsSummary}`,
        workspaceId
      );
      // Re-plan with user's answer
      const newRawTasks = await parseNextPlanToTasks(
        `User response: "${userAnswer}"\n\nOriginal context: ${currentPlan}\n\nResults: ${taskResultsSummary}`,
        targetedPanes,
        providerInstance
      );
      return {
        completed: false,
        newTasks: newRawTasks.map((t) => ({
          terminalId: t.terminalId,
          command: t.command,
        })),
      };
    }
  }

  if (reviewObj.status === "COMPLETED") {
    const summary = reviewObj.summary || "Goal achieved.";
    upsertMessage(workspaceId, {
      id: execMsgId,
      role: "agent",
      content: `🎉 **Orchestration Complete!**\n\n${summary}`,
      timestamp: Date.now(),
    });
    logFn("Orchestration completed successfully");
    for (const p of targetedPanes) {
      setTerminalState(p.id, "Completed");
    }
    return { completed: true };
  }

  const explanation = reviewObj.explanation || "Needs improvement.";
  logFn(`Review: ${explanation}`, "warn");
  upsertMessage(workspaceId, {
    id: execMsgId,
    role: "agent",
    content: `🔄 **Iteration ${currentIteration} needs improvement:**\n${explanation}\n\nStarting next iteration...`,
    timestamp: Date.now(),
  });

  // Parse new tasks from review
  const newRawTasks = await parseNextPlanToTasks(
    reviewObj.nextPlan || "",
    targetedPanes,
    providerInstance
  );
  const newTasks: TaskInput[] = newRawTasks.map((t) => ({
    terminalId: t.terminalId,
    command: t.command,
  }));
  return { completed: false, newTasks };
}

async function parseTasksWithFallback(
  approvedPlan: string | undefined,
  currentPlan: string,
  targetedPanes: { id: string; title: string; name?: string }[],
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>,
  _requestId: string,
  logFn: (msg: string, type?: "info" | "warn" | "error") => void
): Promise<TaskInput[]> {
  try {
    const rawTasks = await parsePlanToTasks(
      approvedPlan || currentPlan,
      targetedPanes,
      providerInstance
    );
    const parsedTasks = rawTasks.map((t) => ({
      terminalId: t.terminalId,
      command: t.command,
    }));
    logFn(`Parsed ${parsedTasks.length} tasks from plan`, "info");
    return parsedTasks;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logFn(`Failed to parse plan: ${errMsg}. Using fallback.`, "warn");
    const firstPane = targetedPanes[0];
    if (firstPane) {
      return [
        {
          terminalId: firstPane.id,
          command: "echo 'Hyperion task placeholder'",
        },
      ];
    }
    return [];
  }
}

function handleExecutePlanError(
  error: unknown,
  requestId: string,
  targetedPanes: { id: string; title: string; name?: string }[],
  execMsgId: string,
  workspaceId: string,
  setTerminalState: (id: string, s: TerminalState) => void,
  logFn: (msg: string, type?: "info" | "warn" | "error") => void,
  // biome-ignore lint/suspicious/noExplicitAny: matching store type
  upsertMessage: (workspaceId: string, msg: any) => void,
  handleDetailedErrorFn: (
    error: unknown,
    source: "frontend" | "backend" | "ipc" | "api" | "planner" | "terminal",
    requestId: string
  ) => { reason: string; suggestion: string; fullErrorMessage: string }
) {
  const isAbortError =
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "AbortError");
  if (isAbortError) {
    logFn("Execution cancelled by user", "warn");
    toast.info("Execution cancelled.");
    for (const p of targetedPanes) {
      setTerminalState(p.id, "Cancelled");
    }
  } else {
    const { fullErrorMessage } = handleDetailedErrorFn(
      error,
      "planner",
      requestId
    );
    upsertMessage(workspaceId, {
      id: execMsgId,
      role: "agent",
      content: `⚠️ **Execution Error:**\n${fullErrorMessage}`,
      timestamp: Date.now(),
    });
    for (const p of targetedPanes) {
      setTerminalState(p.id, "Failed");
    }
  }
}

function getTargetedPanes(
  targetTerminalId: string,
  panes: { id: string; title: string; name?: string }[]
): { id: string; title: string; name?: string }[] {
  if (targetTerminalId === "all") {
    return panes;
  }
  return panes.filter((p) => p.id === targetTerminalId);
}

async function runIterationLoop(
  requestId: string,
  maxLoops: number,
  approvedPlan: string | undefined,
  currentPlan: string,
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>,
  targetedPanes: { id: string; title: string; name?: string }[],
  workspaceId: string,
  execMsgId: string,
  setTerminalState: (id: string, s: TerminalState) => void,
  logFn: (msg: string, type?: "info" | "warn" | "error") => void,
  // biome-ignore lint/suspicious/noExplicitAny: matching store type
  upsertMessage: (workspaceId: string, msg: any) => void,
  abortSignal: AbortSignal,
  setIterationCount: (count: number) => void,
  askForPermissionFn: (
    question: string,
    context: string,
    wsId: string
  ) => Promise<string>,
  addMessageFn: (wsId: string, msg: AgentMessage) => void
): Promise<void> {
  let completed = false;
  let currentIteration = 1;
  setIterationCount(currentIteration);

  while (!completed && currentIteration <= maxLoops) {
    if (abortSignal.aborted) {
      await cancelOrchestration(requestId);
      throw new Error("AbortError");
    }

    const iterationResult = await executeSingleIteration(
      requestId,
      currentIteration,
      maxLoops,
      approvedPlan || currentPlan,
      currentPlan,
      providerInstance,
      targetedPanes,
      workspaceId,
      execMsgId,
      setTerminalState,
      logFn,
      upsertMessage,
      askForPermissionFn,
      addMessageFn
    );

    if (iterationResult.completed) {
      completed = true;
    } else if (
      iterationResult.newTasks &&
      iterationResult.newTasks.length > 0
    ) {
      currentIteration++;
      setIterationCount(currentIteration);
      await addIteration(requestId, iterationResult.newTasks);
      logFn(
        `Started iteration ${currentIteration} with ${iterationResult.newTasks.length} tasks`,
        "info"
      );
    } else {
      logFn("No new tasks from review, stopping loop", "warn");
      break;
    }
  }

  if (!completed) {
    upsertMessage(workspaceId, {
      id: execMsgId,
      role: "agent",
      content: `⚠️ **Orchestration reached maximum iterations (${maxLoops}).**\nThe goal may not be fully achieved. Review terminal outputs for details.`,
      timestamp: Date.now(),
    });
  }
}

export function AgentSidebar() {
  const {
    isOpen,
    toggleOpen,
    messages,
    addMessage,
    upsertMessage,
    apiKey,
    baseUrl,
    selectedModel,
    provider,
    setTerminalState,
    addLog,
  } = useAgentStore();
  const { activeWorkspaceId, workspaces } = useWorkspaceStore();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [iterationCount, setIterationCount] = useState(0);
  const [targetTerminalId, setTargetTerminalId] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Planner states
  const [plannerState, setPlannerState] = useState<
    "idle" | "planning" | "executing"
  >("idle");
  const [currentPlan, setCurrentPlan] = useState("");
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editedPlanText, setEditedPlanText] = useState("");
  const [planMessageId, setPlanMessageId] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<{
    resolve: (value: string) => void;
    reject: (err: Error) => void;
    question: string;
  } | null>(null);
  const [approvalInput, setApprovalInput] = useState("");

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const workspaceMessages = activeWorkspaceId
    ? (messages[activeWorkspaceId] ?? [])
    : [];

  let statusText = "Orchestrator thinking...";
  if (plannerState === "planning") {
    statusText = "Analyzing request & generating plan...";
  } else if (iterationCount > 0) {
    statusText = `Running terminals... (step ${iterationCount}/${MAX_ITERATIONS})`;
  }

  useEffect(() => {
    // Reference dependencies to satisfy linter rule
    const _ignored = {
      length: workspaceMessages.length,
      typing: isTyping,
      state: plannerState,
    };
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [workspaceMessages.length, isTyping, plannerState]);

  const handleDetailedError = (
    error: unknown,
    source: "frontend" | "backend" | "ipc" | "api" | "planner" | "terminal",
    requestId: string
  ) => {
    const msg = error instanceof Error ? error.message : String(error);
    let reason = "Unknown error";
    let suggestion = "Please try again or check the system status.";

    if (msg.includes("401") || msg.includes("Unauthorized")) {
      reason = "Authentication failed (API key is invalid or missing)";
      suggestion =
        "Go to Settings and check your AI Provider API Key and Base URL.";
    } else if (msg.includes("404") || msg.includes("Not Found")) {
      reason = "Endpoint or model not found";
      suggestion =
        "Check that your Base URL is correct and the selected model exists.";
    } else if (msg.includes("Failed to fetch") || msg.includes("network")) {
      reason = "Network connection issue";
      suggestion =
        "Verify your internet connection and verify if the API provider is online.";
    } else if (msg.includes("timeout")) {
      reason = "Request timed out";
      suggestion =
        "The provider is taking too long to respond. Try again or select a faster model.";
    } else if (msg.includes("Tauri") || msg.includes("invoke")) {
      reason = "IPC bridge communication failure";
      suggestion =
        "Restart the application and ensure Tauri services are running.";
    }

    const fullErrorMessage = `Error Source: ${source.toUpperCase()}\nReason: ${reason}\nDetails: ${msg}\n\nRecovery Suggestion: ${suggestion}`;
    addLog(source, "error", fullErrorMessage, requestId);
    toast.error(`Error: ${reason}`);
    return { reason, suggestion, fullErrorMessage };
  };

  const handleSend = async () => {
    const workspaceId = activeWorkspaceId;
    if (!(input.trim() && workspaceId && activeWorkspace)) {
      return;
    }

    if (!(apiKey && selectedModel)) {
      toast.error("Please configure your AI Provider in Settings first.");
      return;
    }

    const requestId = `req-${safeUUID().slice(0, 8)}`;
    const userMessage: AgentMessage = {
      id: safeUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    addMessage(workspaceId, userMessage);
    const userPrompt = input;
    setInput("");
    setIsTyping(true);
    setPlannerState("planning");
    addLog(
      "planner",
      "info",
      `Initializing task analysis for prompt: "${userPrompt}"`,
      requestId
    );

    // Initialize Plan message slot
    const planMsgId = safeUUID();
    setPlanMessageId(planMsgId);

    try {
      abortControllerRef.current = new AbortController();
      const targetedPanes =
        targetTerminalId === "all"
          ? activeWorkspace.panes
          : activeWorkspace.panes.filter((p) => p.id === targetTerminalId);

      // Generate Plan
      addLog(
        "api",
        "info",
        "Requesting complexity analysis and execution plan from provider",
        requestId
      );
      const providerInstance = ProviderFactory.getProvider(provider);
      providerInstance.initialize(apiKey, baseUrl, selectedModel);

      const planningPrompt = buildPlanningSystemPrompt(targetedPanes);

      // Stream the plan response
      let planContent = "";
      const streamPromise = providerInstance.stream(
        [
          { role: "system", content: planningPrompt },
          { role: "user", content: userPrompt },
        ],
        [],
        (delta) => {
          if (delta.content) {
            planContent += delta.content;
            upsertMessage(workspaceId, {
              id: planMsgId,
              role: "agent",
              content: planContent,
              timestamp: Date.now(),
            });
          }
        },
        abortControllerRef.current.signal
      );

      await streamPromise;

      setCurrentPlan(planContent);
      setEditedPlanText(planContent);
      setIsTyping(false);
      addLog(
        "planner",
        "info",
        "Orchestration plan generated successfully",
        requestId
      );
    } catch (error: unknown) {
      if (
        (error instanceof Error && error.name === "AbortError") ||
        abortControllerRef.current?.signal.aborted
      ) {
        addLog("planner", "warn", "Planning cancelled by user", requestId);
        toast.info("Planning cancelled.");
        setPlannerState("idle");
      } else {
        const { fullErrorMessage } = handleDetailedError(
          error,
          "planner",
          requestId
        );
        upsertMessage(workspaceId, {
          id: planMsgId,
          role: "agent",
          content: `⚠️ Failed to generate plan.\n\n${fullErrorMessage}`,
          timestamp: Date.now(),
        });
        setPlannerState("idle");
      }
      setIsTyping(false);
    }
  };

  const executePlan = async (approvedPlan?: string) => {
    const workspaceId = activeWorkspaceId;
    if (!(workspaceId && activeWorkspace)) {
      return;
    }
    const requestId = `req-${safeUUID().slice(0, 8)}`;
    setPlannerState("executing");
    setIsTyping(true);
    setIterationCount(0);
    addLog("planner", "info", "Starting orchestration engine", requestId);

    const targetedPanes = getTargetedPanes(
      targetTerminalId,
      activeWorkspace.panes
    );

    for (const p of targetedPanes) {
      setTerminalState(p.id, "Planning");
    }

    const execMsgId = safeUUID();
    upsertMessage(workspaceId, {
      id: execMsgId,
      role: "agent",
      content: "🚀 **Initializing Orchestrator**\nParsing execution plan...",
      timestamp: Date.now(),
    });

    try {
      abortControllerRef.current = new AbortController();

      const providerInstance = ProviderFactory.getProvider(provider);
      providerInstance.initialize(apiKey, baseUrl, selectedModel);

      const logFn = (msg: string, type?: "info" | "warn" | "error") =>
        addLog("planner", type || "info", msg, requestId);

      // 1. Parse plan into tasks with fallback handling
      const parsedTasks = await parseTasksWithFallback(
        approvedPlan,
        currentPlan,
        targetedPanes,
        providerInstance,
        requestId,
        logFn
      );

      if (parsedTasks.length === 0) {
        throw new Error("No tasks could be parsed from the execution plan.");
      }

      // 2. Pre-execution approval step
      if (parsedTasks.length > 0) {
        const taskSummary = parsedTasks
          .map(
            (t, i) =>
              `${i + 1}. Terminal "${t.terminalId}" → \`${t.command}\``
          )
          .join("\n");

        upsertMessage(workspaceId, {
          id: execMsgId,
          role: "agent",
          content: `📋 **Execution Plan — ${parsedTasks.length} tasks**\n\n${taskSummary}\n\n_Reply "approve" to execute, or tell me what to change._`,
          timestamp: Date.now(),
        });

        try {
          const approval = await waitForUserResponse(
            "Do you approve this execution plan?"
          );
          const approved = [
            "approve",
            "yes",
            "y",
            "continue",
            "go ahead",
            "run",
            "execute",
          ];
          if (
            !approved.includes(approval.toLowerCase().trim())
          ) {
            upsertMessage(workspaceId, {
              id: safeUUID(),
              role: "agent",
              content: `⏸ **Plan paused.** You said: "${approval}"\n\nHow should I adjust the plan?`,
              timestamp: Date.now(),
            });
            return;
          }
        } catch {
          return;
        }
      }

      // 3. Start orchestration via backend
      upsertMessage(workspaceId, {
        id: execMsgId,
        role: "agent",
        content: `🚀 **Dispatching ${parsedTasks.length} tasks to terminals...**`,
        timestamp: Date.now(),
      });

      for (const p of targetedPanes) {
        setTerminalState(p.id, "Waiting");
      }

      await startOrchestration(
        requestId,
        workspaceId,
        approvedPlan || currentPlan,
        parsedTasks,
        5 // max iterations
      );
      addLog(
        "planner",
        "info",
        "Orchestration started, tasks dispatched",
        requestId
      );

      // 3. Run iteration loop
      await runIterationLoop(
        requestId,
        5, // maxLoops
        approvedPlan,
        currentPlan,
        providerInstance,
        targetedPanes,
        workspaceId,
        execMsgId,
        setTerminalState,
        logFn,
        upsertMessage,
        abortControllerRef.current.signal,
        setIterationCount,
        askForPermission,
        addMessage
      );
    } catch (error: unknown) {
      const logFn = (msg: string, type?: "info" | "warn" | "error") =>
        addLog("planner", type || "info", msg, requestId);
      handleExecutePlanError(
        error,
        requestId,
        targetedPanes,
        execMsgId,
        workspaceId,
        setTerminalState,
        logFn,
        upsertMessage,
        handleDetailedError
      );
    } finally {
      setIsTyping(false);
      setIterationCount(0);
      abortControllerRef.current = null;
      setPlannerState("idle");
    }
  };

  const handleStop = () => {
    if (pendingQuestion) {
      pendingQuestion.reject(new Error("AbortError"));
      setPendingQuestion(null);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTyping(false);
    setPlannerState("idle");
  };

  // ─── Interactive agent helpers ───
  const handleAgentResponse = (response: string) => {
    pendingQuestion?.resolve(response);
    setPendingQuestion(null);
  };

  const waitForUserResponse = (question: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      setPendingQuestion({ resolve, reject, question });
    });
  };

  async function askForPermission(
    question: string,
    context: string,
    wsId: string
  ): Promise<string> {
    const msgId = safeUUID();
    addMessage(wsId, {
      id: msgId,
      role: "agent",
      content: `🤔 **${question}**\n\n${context}\n\n_Waiting for your response..._`,
      timestamp: Date.now(),
    });

    const userResponse = await waitForUserResponse(question);
    return userResponse;
  }

  const handleNewChat = () => {
    if (!activeWorkspaceId) {
      return;
    }
    useAgentStore.getState().clearMessages(activeWorkspaceId);
    toast.success("Started new chat");
  };

  const handleClearChat = () => {
    if (!activeWorkspaceId) {
      return;
    }
    useAgentStore.getState().clearMessages(activeWorkspaceId);
    toast.success("Conversation cleared");
  };

  const saveEditedPlan = () => {
    const workspaceId = activeWorkspaceId;
    if (!workspaceId) {
      return;
    }
    setIsEditingPlan(false);
    setCurrentPlan(editedPlanText);
    upsertMessage(workspaceId, {
      id: planMessageId,
      role: "agent",
      content: editedPlanText,
      timestamp: Date.now(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && activeWorkspace && (
        <motion.div
          animate={{ width: "400px", opacity: 1 }}
          className="flex h-full shrink-0 flex-col overflow-hidden border-border/40 border-l bg-background/50 backdrop-blur-xl"
          exit={{ width: 0, opacity: 0 }}
          initial={{ width: 0, opacity: 0 }}
          key="agent-sidebar"
          transition={{ bounce: 0, duration: 0.3, type: "spring" }}
        >
          <div className="flex h-full w-[400px] flex-col overflow-hidden">
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-border/40 border-b px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <span className="font-semibold text-sm tracking-tight">
                  Main Agent
                </span>
              </div>
              <Button
                className="size-7 rounded-lg hover:bg-muted"
                onClick={() => toggleOpen()}
                size="icon"
                variant="ghost"
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Agent Toolbar */}
            <div className="flex shrink-0 items-center justify-between border-border/30 border-b bg-muted/20 px-4 py-1.5">
              <div className="flex items-center gap-1">
                <button
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={handleNewChat}
                  title="New Chat"
                  type="button"
                >
                  <Plus className="size-3.5" />
                </button>
                <button
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={handleClearChat}
                  title="Clear Conversation"
                  type="button"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  className="flex size-6 items-center justify-center rounded-md text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:pointer-events-none"
                  onClick={handleStop}
                  disabled={plannerState === "idle"}
                  title={plannerState !== "idle" ? "Stop Execution" : "Nothing to stop"}
                  type="button"
                >
                  <Square className="size-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {iterationCount > 0 && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                    Step {iterationCount}/{MAX_ITERATIONS}
                  </span>
                )}
                {plannerState !== "idle" && (
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-500">
                    {plannerState === "planning" ? "Planning" : "Executing"}
                  </span>
                )}
              </div>
            </div>

            {/* Chat History */}
            <ScrollArea className="min-h-0 flex-1" ref={scrollRef}>
              <div className="flex flex-col gap-4 p-4">
                {workspaceMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 pt-10 text-center text-muted-foreground">
                    <Sparkles className="size-8 opacity-20" />
                    <p className="text-sm">
                      I'm your Main Agent.
                      <br />
                      Ask me to plan and execute tasks across your AI terminal
                      agents.
                    </p>
                  </div>
                ) : (
                  workspaceMessages.map((msg) => (
                    <div
                      className={cn(
                        "flex gap-3 text-sm",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                      key={msg.id}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          msg.role === "user"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border/40 bg-muted text-foreground"
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="size-4" />
                        ) : (
                          <Sparkles className="size-4" />
                        )}
                      </div>
                      <div className="flex max-w-[80%] flex-col gap-1.5">
                        <div
                          className={cn(
                            "flex flex-col gap-1 rounded-2xl px-4 py-3",
                            msg.role === "user"
                              ? "rounded-tr-sm bg-primary text-primary-foreground"
                              : "rounded-tl-sm border border-border/40 bg-muted/60 text-foreground"
                          )}
                        >
                          {msg.id === planMessageId && isEditingPlan ? (
                            <div className="flex flex-col gap-2">
                              <Textarea
                                className="min-h-[140px] w-[260px] font-mono text-xs"
                                onChange={(e) =>
                                  setEditedPlanText(e.target.value)
                                }
                                value={editedPlanText}
                              />
                              <div className="flex items-center gap-2 self-end">
                                <Button
                                  className="h-6 text-[10px]"
                                  onClick={() => setIsEditingPlan(false)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="h-6 text-[10px]"
                                  onClick={saveEditedPlan}
                                  size="sm"
                                  variant="secondary"
                                >
                                  Save Plan
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="prose prose-invert max-w-none break-words leading-relaxed [&_a]:text-primary [&_h1]:mb-2 [&_h1]:text-sm [&_h2]:mb-2 [&_h2]:text-sm [&_h3]:mb-1 [&_h3]:text-xs [&_h4]:text-xs [&_li]:text-xs [&_p]:text-xs [&_pre]:my-2 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-[10px] [&_pre]:shadow-inner [&_strong]:text-foreground">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Interactive Buttons for Planning Mode */}
                        {msg.id === planMessageId &&
                          plannerState === "planning" &&
                          !isTyping && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <Button
                                className="h-6.5 gap-1 text-[10px]"
                                onClick={() => executePlan(currentPlan)}
                                size="sm"
                              >
                                <Check className="size-3" /> Approve Plan
                              </Button>
                              <Button
                                className="h-6.5 gap-1 text-[10px]"
                                onClick={() => setIsEditingPlan(true)}
                                size="sm"
                                variant="secondary"
                              >
                                <Edit2 className="size-3" /> Edit Plan
                              </Button>
                              <Button
                                className="h-6.5 gap-1 text-[10px]"
                                onClick={() => executePlan()}
                                size="sm"
                                variant="outline"
                              >
                                <Play className="size-3" /> Skip Planning
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex flex-row gap-3 text-sm">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted text-foreground">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-border/40 bg-muted/60 px-4 py-3 text-foreground">
                      <Loader2 className="size-4 animate-spin opacity-70" />
                      <span className="font-medium text-micro opacity-70">
                        {statusText}
                      </span>
                    </div>
                  </div>
                )}
                {/* Pending Question / Approval Request */}
                {pendingQuestion && (
                  <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
                    <div className="flex items-center gap-2 text-xs text-foreground/80">
                      <HelpCircle className="size-3.5 text-primary" />
                      <span className="font-medium">Agent needs input:</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pendingQuestion.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 flex-1 text-xs"
                        onChange={(e) => setApprovalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAgentResponse(approvalInput);
                            setApprovalInput("");
                          }
                        }}
                        placeholder="Type your response..."
                        value={approvalInput}
                      />
                      <Button
                        className="h-8 shrink-0 px-3 text-[10px]"
                        onClick={() => {
                          handleAgentResponse(approvalInput);
                          setApprovalInput("");
                        }}
                        size="sm"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="shrink-0 border-border/40 border-t bg-background/50 p-4 backdrop-blur-md">
              <div className="flex flex-col gap-3 overflow-hidden rounded-xl border border-border/50 bg-background transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
                <Textarea
                  className="min-h-[80px] w-full resize-none border-0 bg-transparent p-3 text-sm shadow-none focus-visible:ring-0"
                  disabled={isTyping || plannerState === "planning"}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (pendingQuestion) {
                        handleAgentResponse(input);
                        setInput("");
                      } else {
                        handleSend();
                      }
                    }
                  }}
                  placeholder={
                    pendingQuestion
                      ? "Respond to the agent..."
                      : "Ask the Main Agent to plan and execute a task..."
                  }
                  value={input}
                />
                <div className="flex items-center justify-between border-border/40 border-t bg-muted/20 px-3 py-2">
                  <Select
                    disabled={isTyping || plannerState === "planning"}
                    onValueChange={setTargetTerminalId}
                    value={targetTerminalId}
                  >
                    <SelectTrigger className="h-7 w-[160px] border-border/40 bg-background text-xs shadow-none">
                      <div className="flex items-center gap-1.5">
                        <TerminalSquare className="size-3.5 opacity-70" />
                        <SelectValue placeholder="Target Terminal" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terminals</SelectItem>
                      {activeWorkspace.panes.map((pane) => (
                        <SelectItem key={pane.id} value={pane.id}>
                          {pane.name ? `${pane.name} (${pane.title})` : pane.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="h-7 gap-1.5 rounded-lg px-3"
                    disabled={!(input.trim() || isTyping)}
                    onClick={() => {
                      if (pendingQuestion) {
                        handleAgentResponse(input);
                        setInput("");
                      } else if (isTyping) {
                        handleStop();
                      } else {
                        handleSend();
                      }
                    }}
                    size="sm"
                    variant={
                      isTyping || pendingQuestion
                        ? "destructive"
                        : "default"
                    }
                  >
                    {isTyping ? (
                      <Square className="size-3.5 fill-current" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    <span>
                      {isTyping
                        ? "Stop"
                        : pendingQuestion
                          ? "Reply"
                          : "Send"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
