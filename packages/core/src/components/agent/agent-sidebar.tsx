"use client";

import { ProviderFactory } from "@workspace/core/lib/providers/provider-factory";
import { type Task, TaskDispatcher } from "@workspace/core/lib/task-dispatcher";
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
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import {
  Check,
  Edit2,
  Loader2,
  Play,
  Send,
  Sparkles,
  Square,
  TerminalSquare,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_ITERATIONS = 20;

function getTerminalStateFromTaskStatus(status: Task["status"]): TerminalState {
  switch (status) {
    case "Queued":
      return "Waiting";
    case "Dispatched":
    case "Acknowledged":
    case "Running":
      return "Running";
    case "Streaming":
      return "Streaming";
    case "Completed":
      return "Completed";
    case "Failed":
      return "Failed";
    case "Retry":
      return "Retrying";
    default:
      return "Running";
  }
}

function formatTaskStatusMessage(task: Task): string {
  const outputSection = task.output
    ? `\n**Output:**\n\`\`\`\n${task.output.slice(-1000)}\n\`\`\``
    : "";
  const errorSection = task.error ? `\n⚠️ **Error:** ${task.error}` : "";

  return `### 📋 Task Dispatcher Status Update
Workspace: \`${task.workspaceId}\`
Parent Request: \`${task.parentRequestId}\`

- **Task ID:** \`${task.id}\`
- **Terminal ID:** \`${task.terminalId}\`
- **Command:** \`${task.payload.command}\`
- **Status:** **${task.status}** ${task.retryCount > 0 ? `(Retry ${task.retryCount}/3)` : ""}${outputSection}${errorSection}`;
}

function buildPlanningSystemPrompt(
  panes: { id: string; title: string }[]
): string {
  const agentList = panes
    .map((p, i) => `  - Agent ${i + 1}: id="${p.id}" (${p.title})`)
    .join("\n");

  return `You are the Hyperion Orchestrator Planner. Your task is to analyze the user request and generate a structured execution plan.
You have ${panes.length} terminal agents:
${agentList}

Generate a clear, bulleted plan showing which terminal agent will perform what actions. Break down the tasks logically and ensure there are no overlapping tasks. Do not call any tools.`;
}

async function parsePlanToTasks(
  planText: string,
  targetedPanes: { id: string; title: string }[],
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>
): Promise<Array<{ terminalId: string; command: string }>> {
  const parserPrompt = `You are a structured task parser. Your job is to extract executable terminal commands from a natural language execution plan.
You have access to the following terminal IDs: ${targetedPanes.map((p) => `"${p.id}" (${p.title})`).join(", ")}.

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
  targetedPanes: { id: string; title: string }[],
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>
): Promise<Array<{ terminalId: string; command: string }>> {
  const nextParserPrompt = `You are a structured task parser. Extract the terminal commands from this plan:
"${nextPlan}"

Available terminal IDs: ${targetedPanes.map((p) => `"${p.id}" (${p.title})`).join(", ")}.

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

async function runOrchestrationLoop(
  initialTasks: Array<{ terminalId: string; command: string }>,
  dispatcher: any,
  planGoal: string,
  providerInstance: ReturnType<typeof ProviderFactory.getProvider>,
  targetedPanes: { id: string; title: string }[],
  abortSignal: AbortSignal | undefined,
  requestId: string,
  onIterationChange: (count: number) => void,
  onMessageUpdate: (content: string, isCompleted: boolean) => void,
  logFn: (msg: string, type: "info" | "warn" | "error") => void
): Promise<void> {
  let parsedTasks = [...initialTasks];
  let loopCount = 0;
  const maxLoops = 5;
  let completedOrchestration = false;

  while (!completedOrchestration && loopCount < maxLoops) {
    loopCount++;
    onIterationChange(loopCount);
    logFn(
      `Starting Orchestration Loop Iteration ${loopCount}/${maxLoops}...`,
      "info"
    );

    if (abortSignal?.aborted) {
      logFn("Execution loop aborted", "warn");
      break;
    }

    // 1. Dispatch tasks in parallel
    const dispatchPromises = parsedTasks.map((taskItem) =>
      dispatcher.dispatch(taskItem.terminalId, taskItem.command)
    );
    const tasks = await Promise.all(dispatchPromises);

    // 2. Wait for Results of all dispatched tasks
    const monitorPromises = tasks.map((task: any) =>
      dispatcher.monitorExecution(task)
    );
    const executedTasks = await Promise.all(monitorPromises);

    // Summarize outputs for reviewer
    const taskResultsSummary = executedTasks
      .map(
        (task: any) => `
---
Terminal: ${task.terminalId}
Command: ${task.payload.command}
Status: ${task.status}
Error: ${task.error || "None"}
Output:
${task.output || "[No output]"}
`
      )
      .join("\n");

    // 3. Review Results
    logFn("Reviewing task execution results...", "info");

    const reviewObj = await reviewExecutionResults(
      planGoal,
      taskResultsSummary,
      providerInstance
    );

    if (reviewObj.status === "COMPLETED") {
      completedOrchestration = true;
      const summary = reviewObj.summary || "Goal achieved.";
      onMessageUpdate(
        `🎉 **Orchestration Completed successfully!**\n\n${summary}`,
        true
      );
      logFn("Orchestration review passed. Completed.", "info");
    } else {
      const explanation =
        reviewObj.explanation || "Execution needs improvement.";
      logFn(`Orchestration review flagged issues: ${explanation}`, "warn");
      onMessageUpdate(
        `🔄 **Iteration ${loopCount} Review:**\n${explanation}\n\n*Next Plan:* ${reviewObj.nextPlan}`,
        false
      );

      // Parse nextPlan to get the next tasks to execute
      parsedTasks = await parseNextPlanToTasks(
        reviewObj.nextPlan || "",
        targetedPanes,
        providerInstance
      );
    }
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
    addLog(
      "planner",
      "info",
      "Starting execution of the approved orchestration loop",
      requestId
    );

    const targetedPanes =
      targetTerminalId === "all"
        ? activeWorkspace.panes
        : activeWorkspace.panes.filter((p) => p.id === targetTerminalId);

    for (const p of targetedPanes) {
      setTerminalState(p.id, "Planning");
    }

    const execMsgId = safeUUID();
    let accumulatedAgentContent =
      "🚀 **Initializing Orchestrator Loop**\nRunning task dispatcher...";

    upsertMessage(workspaceId, {
      id: execMsgId,
      role: "agent",
      content: accumulatedAgentContent,
      timestamp: Date.now(),
    });

    try {
      abortControllerRef.current = new AbortController();

      addLog(
        "planner",
        "info",
        "Parsing execution plan into concrete terminal commands...",
        requestId
      );

      const providerInstance = ProviderFactory.getProvider(provider);
      providerInstance.initialize(apiKey, baseUrl, selectedModel);

      let parsedTasks: Array<{ terminalId: string; command: string }> = [];
      try {
        parsedTasks = await parsePlanToTasks(
          approvedPlan || currentPlan,
          targetedPanes,
          providerInstance
        );
        addLog(
          "planner",
          "info",
          `Successfully parsed ${parsedTasks.length} tasks from execution plan.`,
          requestId
        );
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        addLog(
          "planner",
          "warn",
          `Failed to parse plan via LLM: ${errMsg}. Falling back to default shell commands.`,
          requestId
        );
        const firstPane = targetedPanes[0];
        if (firstPane) {
          parsedTasks = [
            { terminalId: firstPane.id, command: "echo running task" },
          ];
        }
      }

      const { TaskDispatcher } = await import(
        "@workspace/core/lib/task-dispatcher"
      );

      const onTaskUpdate = (task: Task) => {
        const taskMsgContent = formatTaskStatusMessage(task);

        upsertMessage(workspaceId, {
          id: `task-msg-${task.id}`,
          role: "system",
          content: taskMsgContent,
          timestamp: Date.now(),
        });

        const mappedState = getTerminalStateFromTaskStatus(task.status);
        setTerminalState(task.terminalId, mappedState);
      };

      const logFn = (msg: string, type: "info" | "warn" | "error" = "info") => {
        addLog("planner", type, msg, requestId);
      };

      const dispatcher = new TaskDispatcher(
        workspaceId,
        requestId,
        onTaskUpdate,
        logFn
      );

      await runOrchestrationLoop(
        parsedTasks,
        dispatcher,
        approvedPlan || currentPlan,
        providerInstance,
        targetedPanes,
        abortControllerRef.current.signal,
        requestId,
        (count) => setIterationCount(count),
        (content) => {
          accumulatedAgentContent = content;
          upsertMessage(workspaceId, {
            id: execMsgId,
            role: "agent",
            content,
            timestamp: Date.now(),
          });
        },
        (msg, type) => addLog("planner", type, msg, requestId)
      );

      for (const p of targetedPanes) {
        setTerminalState(p.id, "Completed");
      }
      addLog(
        "planner",
        "info",
        "Autonomous loop executed successfully",
        requestId
      );
    } catch (error: unknown) {
      const isAbortError =
        error instanceof Error && error.name === "AbortError";
      if (isAbortError || abortControllerRef.current?.signal.aborted) {
        addLog(
          "planner",
          "warn",
          "Execution loop cancelled by user",
          requestId
        );
        toast.info("Execution cancelled.");
        for (const p of targetedPanes) {
          setTerminalState(p.id, "Cancelled");
        }
      } else {
        const { fullErrorMessage } = handleDetailedError(
          error,
          "planner",
          requestId
        );
        accumulatedAgentContent = `⚠️ **Execution Error:**\n${fullErrorMessage}`;
        upsertMessage(workspaceId, {
          id: execMsgId,
          role: "agent",
          content: accumulatedAgentContent,
          timestamp: Date.now(),
        });
        for (const p of targetedPanes) {
          setTerminalState(p.id, "Failed");
        }
      }
    } finally {
      setIsTyping(false);
      setIterationCount(0);
      abortControllerRef.current = null;
      setPlannerState("idle");
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTyping(false);
    setPlannerState("idle");
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
                            <p className="whitespace-pre-wrap text-xs leading-relaxed">
                              {msg.content}
                            </p>
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
                      <span className="font-medium text-xs opacity-70">
                        {statusText}
                      </span>
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
                      handleSend();
                    }
                  }}
                  placeholder="Ask the Main Agent to plan and execute a task..."
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
                          {pane.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="h-7 gap-1.5 rounded-lg px-3"
                    disabled={!(input.trim() || isTyping)}
                    onClick={() => (isTyping ? handleStop() : handleSend())}
                    size="sm"
                    variant={isTyping ? "destructive" : "default"}
                  >
                    {isTyping ? (
                      <Square className="size-3.5 fill-current" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    <span>{isTyping ? "Stop" : "Send"}</span>
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
