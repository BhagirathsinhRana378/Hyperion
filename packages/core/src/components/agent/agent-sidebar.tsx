"use client";

import { ProviderFactory } from "@workspace/core/lib/providers/provider-factory";
import { safeUUID } from "@workspace/core/lib/uuid";
import {
  type AgentMessage,
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
const MAX_HISTORY_CHARS = 2000;
const NUMBER_REGEX = /\d+/;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveAgentPanes(
  agentIdInput: string,
  targetPanes: { id: string; title: string }[]
): { id: string; title: string }[] {
  const cleanId = agentIdInput.trim().toLowerCase();

  if (cleanId === "all") {
    return targetPanes;
  }

  // 1. Direct UUID match
  const directMatch = targetPanes.filter((p) => p.id === agentIdInput);
  if (directMatch.length > 0) {
    return directMatch;
  }

  // 2. Index match (e.g. "1" or "2" or "Agent 1" or "Terminal 1")
  const numberMatch = cleanId.match(NUMBER_REGEX);
  if (numberMatch) {
    const index = Number.parseInt(numberMatch[0], 10) - 1;
    if (index >= 0 && index < targetPanes.length) {
      const pane = targetPanes[index];
      if (pane) {
        return [pane];
      }
    }
  }

  // 3. Title match (case-insensitive substring)
  const titleMatch = targetPanes.filter((p) =>
    p.title.toLowerCase().includes(cleanId)
  );
  if (titleMatch.length > 0) {
    return titleMatch;
  }

  return [];
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

function buildExecutionSystemPrompt(
  panes: { id: string; title: string }[],
  approvedPlan?: string
): string {
  const agentList = panes
    .map((p, i) => `  - Agent ${i + 1}: id="${p.id}" (${p.title})`)
    .join("\n");

  let planSection = "";
  if (approvedPlan) {
    planSection = `\n## Approved Plan to Follow\n${approvedPlan}\n`;
  }

  return `You are the Hyperion Main Agent — an elite Autonomous Workspace Orchestrator. You coordinate multiple terminal sessions to accomplish complex, multi-step engineering tasks.${planSection}

## Your Terminal Agents
You have ${panes.length} AI coding assistants (e.g. Claude Code) running in separate terminals:
${agentList}

## Your Tools
1. prompt_agent(agent_id, prompt) — Type a natural-language instruction into a Terminal Agent's input. This ONLY types the text — it does NOT press Enter.
2. send_prompt(agent_id) — Press Enter on the Terminal Agent to submit the typed prompt. You MUST call this after every prompt_agent call.
3. observe_agent(agent_id) — Read the Terminal Agent's recent output to check progress.
4. wait(seconds) — Pause for 1-30 seconds. ALWAYS wait 5-15 seconds after submitting a prompt before observing.

## Coordination & Orchestration Rules (STRICTLY enforced)
1. **Multi-Terminal Coordination**: You can orchestrate multiple terminals at once. Make sure you track the role and progress of each session.
2. **Context Preservation**: Always remember what task you assigned to each terminal. Treat the terminals as your team of developers.
3. **Stall & Progress Monitoring**: After submitting a prompt, you MUST call wait(10) then observe_agent(agent_id).
   - If the output is unchanged twice in a row, the terminal might be stuck or command was not submitted. Re-type and re-submit the prompt.
4. **Auto-Recovery & Retries**: If a terminal command fails, analyze the error, send a follow-up corrective prompt, and retry. Never give up on first failure.
5. **Completion Verification**: You must continue your execution loop until you have read the terminal outputs and verified that all tasks succeeded. Once complete, summarize the work done and confirm success.

## Critical Rules
- You are a PLANNER. NEVER send raw bash commands like 'ls', 'cat', 'cd'. Write prompts in natural language.
- Each prompt must be ONE LINE, under 200 characters. No newlines.
- ALWAYS call send_prompt() immediately after prompt_agent().
- ONLY target agent IDs listed in the active Terminal Agents section.
- If the task is simple and doesn't require terminals, answer directly without tools.`;
}

const TOOLS_DEFINITION = [
  {
    type: "function" as const,
    function: {
      name: "prompt_agent",
      description:
        "Type a short, single-line natural language instruction into a Terminal Agent's input. This ONLY types the text — you MUST call send_prompt after this to actually submit it.",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description:
              "The agent ID from the list, or 'all' to prompt every agent.",
          },
          prompt: {
            type: "string",
            description:
              "A short, single-line natural language instruction (under 200 chars, no newlines).",
          },
        },
        required: ["agent_id", "prompt"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "send_prompt",
      description:
        "Press Enter on a Terminal Agent to submit the previously typed prompt. MUST be called after every prompt_agent call.",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description:
              "The agent ID to press Enter on, or 'all' to submit on all agents.",
          },
        },
        required: ["agent_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "observe_agent",
      description:
        "Read the recent output of a Terminal Agent to check their progress and response.",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description: "The agent ID from the list.",
          },
        },
        required: ["agent_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "wait",
      description:
        "Pause execution for a number of seconds. Use this after sending a prompt to give the agent time to process before observing.",
      parameters: {
        type: "object",
        properties: {
          seconds: {
            type: "number",
            description: "Number of seconds to wait (1-30).",
          },
        },
        required: ["seconds"],
      },
    },
  },
];

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

  useEffect(() => {
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
    error: any,
    source: "frontend" | "backend" | "ipc" | "api" | "planner" | "terminal",
    requestId: string
  ) => {
    const msg = error.message || String(error);
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
    } catch (error: any) {
      if (
        error.name === "AbortError" ||
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

    // Set targeted terminal states to Planning initially
    const targetedPanes =
      targetTerminalId === "all"
        ? activeWorkspace.panes
        : activeWorkspace.panes.filter((p) => p.id === targetTerminalId);

    for (const p of targetedPanes) {
      setTerminalState(p.id, "Planning");
    }

    const execMsgId = safeUUID();
    let accumulatedAgentContent = "";

    try {
      abortControllerRef.current = new AbortController();
      const systemPrompt = buildExecutionSystemPrompt(
        targetedPanes,
        approvedPlan
      );

      const currentMessages: any[] = [
        { role: "system", content: systemPrompt },
        ...workspaceMessages.map((m) => ({
          role: m.role === "agent" ? "assistant" : m.role,
          content: m.content,
        })),
      ];

      let isFinished = false;
      let iterations = 0;
      const lastObservedOutput: Record<string, string> = {};
      const isTauri =
        typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

      const providerInstance = ProviderFactory.getProvider(provider);
      providerInstance.initialize(apiKey, baseUrl, selectedModel);

      while (!isFinished && iterations < MAX_ITERATIONS) {
        iterations++;
        setIterationCount(iterations);

        if (abortControllerRef.current?.signal.aborted) {
          addLog("planner", "warn", "Execution loop aborted", requestId);
          break;
        }

        // Set running state on terminals
        for (const p of targetedPanes) {
          setTerminalState(p.id, "Running");
        }

        addLog(
          "api",
          "info",
          `Step ${iterations}: Requesting orchestration delta from provider`,
          requestId
        );

        let stepContent = "";
        let accumulatedDelta: any = null;

        const streamResult = await providerInstance.stream(
          currentMessages,
          TOOLS_DEFINITION,
          (delta) => {
            if (delta.content) {
              stepContent += delta.content;
              accumulatedAgentContent += delta.content;
              upsertMessage(workspaceId, {
                id: execMsgId,
                role: "agent",
                content: accumulatedAgentContent,
                timestamp: Date.now(),
              });
            }
            if (delta.toolCalls) {
              accumulatedDelta = accumulatedDelta || {};
              accumulatedDelta.tool_calls = delta.toolCalls;
            }
          },
          abortControllerRef.current.signal
        );

        const message = {
          role: "assistant",
          content: streamResult.content,
          tool_calls: streamResult.tool_calls,
        };

        if (message.content) {
          accumulatedAgentContent +=
            (accumulatedAgentContent ? "\n" : "") + message.content;
        }

        if (message.tool_calls && message.tool_calls.length > 0) {
          currentMessages.push(message);

          if (isTauri) {
            const { invoke } = await import("@tauri-apps/api/core");

            for (const toolCall of message.tool_calls) {
              const fnName = toolCall.function.name;
              const args = JSON.parse(toolCall.function.arguments);

              addLog(
                "ipc",
                "info",
                `Executing tool call: ${fnName} (${JSON.stringify(args)})`,
                requestId
              );

              if (fnName === "prompt_agent") {
                const agentId = args.agent_id;
                const promptContent = args.prompt;
                const panesToRun = resolveAgentPanes(agentId, targetedPanes);

                if (panesToRun.length === 0) {
                  currentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Error: No agent found with id "${agentId}".`,
                  });
                  continue;
                }

                const cleanPrompt = promptContent
                  .replace(/[\n\r]/g, " ")
                  .trim()
                  .slice(0, 500);

                for (const pane of panesToRun) {
                  setTerminalState(pane.id, "Running");
                  let retries = 3;
                  let success = false;
                  while (retries > 0 && !success) {
                    try {
                      await invoke("write_terminal", {
                        id: pane.id,
                        data: cleanPrompt,
                      });
                      success = true;
                      addLog(
                        "terminal",
                        "info",
                        `Prompt typed into terminal: ${pane.title}`,
                        requestId
                      );
                    } catch (err) {
                      retries--;
                      addLog(
                        "terminal",
                        "warn",
                        `Retrying write_terminal: ${pane.title} (${retries} attempts left)`,
                        requestId
                      );
                      if (retries === 0) {
                        throw err;
                      }
                      await sleep(500);
                    }
                  }
                }

                currentMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: `Prompt typed into ${panesToRun.length} agent(s). Call send_prompt() to submit.`,
                });
              } else if (fnName === "send_prompt") {
                const agentId = args.agent_id;
                const panesToSend = resolveAgentPanes(agentId, targetedPanes);

                if (panesToSend.length === 0) {
                  currentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Error: No agent found with id "${agentId}".`,
                  });
                  continue;
                }

                await sleep(200);

                for (const pane of panesToSend) {
                  setTerminalState(pane.id, "Running");
                  await invoke("write_terminal", { id: pane.id, data: "\r" });
                  addLog(
                    "terminal",
                    "info",
                    `Submitted prompt (pressed enter) on terminal: ${pane.title}`,
                    requestId
                  );
                }

                currentMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content:
                    "Submit action complete. Wait and observe output using observe_agent.",
                });
              } else if (fnName === "observe_agent") {
                const agentId = args.agent_id;
                const panesToObserve = resolveAgentPanes(
                  agentId,
                  targetedPanes
                );
                const pane = panesToObserve[0];

                if (!pane) {
                  currentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Error: No agent found with id "${agentId}".`,
                  });
                  continue;
                }

                setTerminalState(pane.id, "Streaming");
                try {
                  const info: { history: string } = await invoke(
                    "get_terminal_history",
                    { id: pane.id }
                  );
                  const rawOutput = info.history.trim();

                  if (!rawOutput) {
                    currentMessages.push({
                      role: "tool",
                      tool_call_id: toolCall.id,
                      content:
                        "[Terminal output is empty. Try waiting longer.]",
                    });
                    continue;
                  }

                  const truncatedOutput = rawOutput.slice(-MAX_HISTORY_CHARS);
                  const lastOutput = lastObservedOutput[pane.id] ?? "";

                  if (truncatedOutput === lastOutput) {
                    currentMessages.push({
                      role: "tool",
                      tool_call_id: toolCall.id,
                      content: `[Output unchanged. Still processing.]\n\nLast output:\n${truncatedOutput}`,
                    });
                  } else {
                    lastObservedOutput[pane.id] = truncatedOutput;
                    currentMessages.push({
                      role: "tool",
                      tool_call_id: toolCall.id,
                      content: truncatedOutput,
                    });
                  }
                  addLog(
                    "terminal",
                    "info",
                    `Observed output from terminal: ${pane.title}`,
                    requestId
                  );
                } catch (e: any) {
                  currentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Error reading agent output: ${e.message || e}`,
                  });
                }
              } else if (fnName === "wait") {
                const seconds = Math.min(
                  30,
                  Math.max(1, Number(args.seconds) || 5)
                );
                addLog(
                  "planner",
                  "info",
                  `Waiting for ${seconds} seconds...`,
                  requestId
                );
                for (const p of targetedPanes) {
                  setTerminalState(p.id, "Waiting");
                }
                await sleep(seconds * 1000);
                currentMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: `Waited ${seconds} seconds.`,
                });
              } else {
                currentMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: `Unknown tool: ${fnName}`,
                });
              }
            }
          } else {
            // Not in Tauri, simulate tool execution success
            for (const toolCall of message.tool_calls) {
              currentMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content:
                  "Simulated execution success (Native terminals unavailable in browser)",
              });
            }
            isFinished = true;
          }
        } else {
          isFinished = true;
        }
      }

      if (iterations >= MAX_ITERATIONS) {
        accumulatedAgentContent +=
          "\n\n⚠️ Reached maximum loop iteration limit. Stopping execution.";
        upsertMessage(workspaceId, {
          id: execMsgId,
          role: "agent",
          content: accumulatedAgentContent,
          timestamp: Date.now(),
        });
      }

      // Mark terminals as completed
      for (const p of targetedPanes) {
        setTerminalState(p.id, "Completed");
      }
      addLog(
        "planner",
        "info",
        "Autonomous loop executed successfully",
        requestId
      );
    } catch (error: any) {
      if (
        error.name === "AbortError" ||
        abortControllerRef.current?.signal.aborted
      ) {
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
        accumulatedAgentContent += `\n\n⚠️ Execution Error:\n${fullErrorMessage}`;
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
                        {plannerState === "planning"
                          ? "Analyzing request & generating plan..."
                          : iterationCount > 0
                            ? `Running terminals... (step ${iterationCount}/${MAX_ITERATIONS})`
                            : "Orchestrator thinking..."}
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
