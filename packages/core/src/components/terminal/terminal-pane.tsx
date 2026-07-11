"use client";

import { useMounted } from "@workspace/core/hooks/use-mounted";
import "@xterm/xterm/css/xterm.css";
import { RotateCcw, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TerminalPaneProps {
  id: string;
  isActiveWorkspace?: boolean;
  title: string;
}

// biome-ignore lint/suspicious/noExplicitAny: xterm types are dynamically imported
type TerminalInstance = any;
// biome-ignore lint/suspicious/noExplicitAny: xterm addon types are dynamically imported
type FitAddonInstance = any;

// Module-level cache for xterm dynamic imports to optimize workspace switching
let xtermPromise: Promise<{
  // biome-ignore lint/suspicious/noExplicitAny: dynamic import
  Terminal: any;
  // biome-ignore lint/suspicious/noExplicitAny: dynamic import
  FitAddon: any;
  // biome-ignore lint/suspicious/noExplicitAny: dynamic import
  WebLinksAddon: any;
}> | null = null;

function loadXterm() {
  if (!xtermPromise) {
    xtermPromise = Promise.all([
      import("@xterm/xterm"),
      import("@xterm/addon-fit"),
      import("@xterm/addon-web-links"),
    ]).then(([xterm, fit, webLinks]) => ({
      Terminal: xterm.Terminal,
      FitAddon: fit.FitAddon,
      WebLinksAddon: webLinks.WebLinksAddon,
    }));
  }
  return xtermPromise;
}

function TerminalPlaceholder({ shellType }: { shellType: string }) {
  const isWin =
    shellType.toLowerCase().includes("cmd") ||
    shellType.toLowerCase().includes("prompt") ||
    shellType.toLowerCase().includes("command");
  const prompt = isWin ? "C:\\Users\\hyperion> " : "hyperion@dev:~$ ";
  const promptColor = isWin ? "text-blue-500/30" : "text-emerald-500/30";

  return (
    <div className="terminal-shimmer-sweep pointer-events-none absolute inset-0 z-10 flex select-none flex-col gap-3 border border-border/10 bg-[#08080a] p-5 font-mono text-xs">
      <div className="flex items-center gap-2 opacity-35">
        <span className="size-2.5 rounded-full bg-red-500/30" />
        <span className="size-2.5 rounded-full bg-yellow-500/30" />
        <span className="size-2.5 rounded-full bg-green-500/30" />
      </div>
      <div className="mt-2 flex animate-pulse items-center gap-2 opacity-50">
        <span className={`${promptColor} font-bold`}>{prompt}</span>
        <div className="h-4 w-32 rounded bg-muted-foreground/10" />
      </div>
      <div className="mt-1 space-y-2 opacity-30">
        <div className="h-3.5 w-[90%] animate-pulse rounded bg-muted-foreground/5 [animation-delay:100ms]" />
        <div className="h-3.5 w-[75%] animate-pulse rounded bg-muted-foreground/5 [animation-delay:200ms]" />
        <div className="h-3.5 w-[80%] animate-pulse rounded bg-muted-foreground/5 [animation-delay:300ms]" />
        <div className="h-3.5 w-[45%] animate-pulse rounded bg-muted-foreground/5 [animation-delay:400ms]" />
      </div>
      <div className="mt-3 flex animate-pulse items-center gap-2 opacity-45 [animation-delay:500ms]">
        <span className={`${promptColor} font-bold`}>{prompt}</span>
        <span className="h-4 w-1.5 animate-pulse bg-muted-foreground/30" />
      </div>
    </div>
  );
}

export function TerminalPane({
  id,
  title,
  isActiveWorkspace = true,
}: TerminalPaneProps) {
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<TerminalInstance>(null);
  const fitAddonRef = useRef<FitAddonInstance>(null);
  const [shellType, setShellType] = useState("Local Shell");
  const [isTauriEnv, setIsTauriEnv] = useState(false);
  const [isTerminalReady, setIsTerminalReady] = useState(false);

  // Buffer input for mock shell
  const inputBufferRef = useRef("");

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const { isTauri } = await import("@tauri-apps/api/core");
        if (isTauri()) {
          setIsTauriEnv(true);
          if (navigator.userAgent.includes("Windows")) {
            setShellType("Command Prompt");
          } else {
            setShellType("Bash Shell");
          }
        } else {
          setShellType("Mock Shell (Web)");
        }
      } catch {
        setShellType("Mock Shell (Web)");
      }
    };
    checkEnvironment();
  }, []);

  const handleMockCommand = useCallback(
    (cmd: string, term: TerminalInstance) => {
      const parts = cmd.split(" ");
      const name = parts[0]?.toLowerCase();

      switch (name) {
        case "":
          break;
        case "help":
          term.writeln("Available mock commands:");
          term.writeln(
            "  \x1b[1;34mhelp\x1b[0m     Display help documentation"
          );
          term.writeln(
            "  \x1b[1;34mneofetch\x1b[0m Show mock OS and ecosystem details"
          );
          term.writeln("  \x1b[1;34mclear\x1b[0m    Clear the terminal screen");
          term.writeln(
            "  \x1b[1;34mecho\x1b[0m     Print arguments to standard output"
          );
          term.writeln("  \x1b[1;34mdate\x1b[0m     Display system local time");
          break;
        case "neofetch":
          term.writeln(
            "   \x1b[1;35m/\\_/\\\x1b[0m      \x1b[1;36mhyperion-demo@web\x1b[0m"
          );
          term.writeln(
            "  \x1b[1;35m( o.o )\x1b[0m     \x1b[0m-----------------\x1b[0m"
          );
          term.writeln(
            "   \x1b[1;35m> ^ <\x1b[0m      \x1b[1;33mOS\x1b[0m: Google Gemini Sandbox (WASM)"
          );
          term.writeln(
            "  \x1b[1;35m/     \\\x1b[0m     \x1b[1;33mKernel\x1b[0m: Next.js v16.2 Client Runtime"
          );
          term.writeln(
            " \x1b[1;35m(|  |  |)\x1b[0m    \x1b[1;33mShell\x1b[0m: TypeScript xterm.js mock-shell"
          );
          term.writeln(
            "  \x1b[1;35m(____|)\x1b[0m     \x1b[1;33mTerminal\x1b[0m: xterm.js Canvas Grid"
          );
          term.writeln(
            "              \x1b[1;33mMemory\x1b[0m: 16.0 GB Virtual RAM"
          );
          break;
        case "clear":
          term.clear();
          break;
        case "echo":
          term.writeln(parts.slice(1).join(" "));
          break;
        case "date":
          term.writeln(new Date().toString());
          break;
        default:
          term.writeln(`hyperion-shell: command not found: ${name}`);
      }
    },
    []
  );

  const setupMockShell = useCallback(
    (term: TerminalInstance) => {
      term.writeln("\x1b[1;35mHyperion Web Shell Terminal\x1b[0m");
      term.writeln(
        "Interactive mock sandbox active. Try: \x1b[1;36mneofetch\x1b[0m, \x1b[1;36mhelp\x1b[0m, \x1b[1;36mclear\x1b[0m.\r\n"
      );
      term.write("\x1b[1;32mhyperion-demo@web:~$\x1b[0m ");

      term.onData((data: string) => {
        if (!termRef.current) {
          return;
        }

        for (const char of data) {
          if (char === "\r") {
            const cmd = inputBufferRef.current.trim();
            term.write("\r\n");
            handleMockCommand(cmd, term);
            inputBufferRef.current = "";
            term.write("\x1b[1;32mhyperion-demo@web:~$\x1b[0m ");
          } else if (char === "\u007f") {
            if (inputBufferRef.current.length > 0) {
              inputBufferRef.current = inputBufferRef.current.slice(0, -1);
              term.write("\b \b");
            }
          } else {
            inputBufferRef.current += char;
            term.write(char);
          }
        }
      });
    },
    [handleMockCommand]
  );

  // Set up PTY terminal
  useEffect(() => {
    if (!(mounted && containerRef.current)) {
      return;
    }

    let disposed = false;
    let observer: ResizeObserver | undefined;
    let unlistenStdout: (() => void) | undefined;

    async function setupTauri(term: TerminalInstance) {
      const { isTauri, invoke } = await import("@tauri-apps/api/core");
      const { listen } = await import("@tauri-apps/api/event");

      if (!isTauri() || disposed) {
        return false;
      }

      const cols = term.cols;
      const rows = term.rows;

      await invoke("create_terminal", { id, cols, rows });

      const history = await invoke<string>("get_terminal_history", { id });
      if (history && !disposed) {
        term.write(history);
      }

      unlistenStdout = await listen<string>(
        `terminal-stdout-${id}`,
        (event) => {
          if (!disposed) {
            term.write(event.payload);
          }
        }
      );

      term.onData((data: string) => {
        invoke("write_terminal", { id, data }).catch((err) => {
          term.writeln(`\r\n\x1b[31mError writing to terminal: ${err}\x1b[0m`);
        });
      });

      return true;
    }

    async function init() {
      const { Terminal, FitAddon, WebLinksAddon } = await loadXterm();

      if (disposed || !containerRef.current) {
        return;
      }

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: "block",
        fontSize: 13,
        lineHeight: 1.25,
        fontFamily:
          "Geist Mono, JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace",
        theme: {
          background: "#08080a",
          cursor: "#a1a1aa",
          cursorAccent: "#08080a",
          foreground: "#e4e4e7",
          selectionBackground: "#3f3f46",
          black: "#18181b",
          red: "#f43f5e",
          green: "#10b981",
          yellow: "#f59e0b",
          blue: "#3b82f6",
          magenta: "#a855f7",
          cyan: "#06b6d4",
          white: "#f4f4f5",
        },
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.open(containerRef.current);

      termRef.current = term;
      fitAddonRef.current = fitAddon;

      // Handle fitting
      requestAnimationFrame(() => {
        if (!disposed) {
          fitAddon.fit();
        }
      });

      observer = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          if (!disposed && fitAddonRef.current) {
            fitAddonRef.current.fit();
            if (termRef.current) {
              const cols = termRef.current.cols;
              const rows = termRef.current.rows;
              resizePty(cols, rows);
            }
          }
        });
      });

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      try {
        const isTauriActive = await setupTauri(term);
        if (!isTauriActive) {
          setupMockShell(term);
        }
      } catch {
        setupMockShell(term);
      } finally {
        if (!disposed) {
          setIsTerminalReady(true);
        }
      }
    }

    async function resizePty(cols: number, rows: number) {
      try {
        const { isTauri, invoke } = await import("@tauri-apps/api/core");
        if (isTauri()) {
          await invoke("resize_terminal", { id, cols, rows });
        }
      } catch {
        // ignore
      }
    }

    init();

    return () => {
      disposed = true;
      observer?.disconnect();
      termRef.current?.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
      if (unlistenStdout) {
        unlistenStdout();
      }

      // Close the PTY process in Rust backend to prevent process leakage
      import("@tauri-apps/api/core")
        .then(({ isTauri, invoke }) => {
          if (isTauri()) {
            invoke("close_terminal", { id }).catch(() => {
              // ignore error
            });
          }
        })
        .catch(() => {
          // ignore error
        });
    };
  }, [id, mounted, setupMockShell]);

  // Fit terminal when workspace becomes active to adapt to container layout
  useEffect(() => {
    if (isActiveWorkspace && termRef.current && fitAddonRef.current) {
      const timer = setTimeout(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
          const cols = termRef.current.cols;
          const rows = termRef.current.rows;
          import("@tauri-apps/api/core").then(({ isTauri, invoke }) => {
            if (isTauri()) {
              invoke("resize_terminal", { id, cols, rows }).catch(() => {
                // ignore resize errors on workspace switch
              });
            }
          });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isActiveWorkspace, id]);

  const handleClear = async () => {
    if (termRef.current) {
      termRef.current.clear();
      if (isTauriEnv) {
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          const clearCmd = navigator.userAgent.includes("Windows")
            ? "cls\r"
            : "clear\r";
          await invoke("write_terminal", { id, data: clearCmd });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleReset = async () => {
    if (isTauriEnv) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("close_terminal", { id });
        if (termRef.current && fitAddonRef.current) {
          termRef.current.clear();
          const cols = termRef.current.cols;
          const rows = termRef.current.rows;
          await invoke("create_terminal", { id, cols, rows });
        }
      } catch {
        // ignore
      }
    } else if (termRef.current) {
      termRef.current.clear();
      termRef.current.writeln(
        "\x1b[1;33mShell session reset successfully.\x1b[0m\r\n"
      );
      termRef.current.write("\x1b[1;32mhyperion-demo@web:~$\x1b[0m ");
    }
  };

  const getBadgeColor = (shell: string) => {
    const s = shell.toLowerCase();
    if (s.includes("powershell")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
    if (s.includes("prompt") || s.includes("cmd")) {
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
    if (s.includes("bash") || s.includes("zsh")) {
      return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
    return "bg-muted/40 text-muted-foreground/60 border border-border/40";
  };

  if (!mounted) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border/30 bg-[#08080a] shadow-md">
        {/* Title Bar / Header Skeleton */}
        <div className="flex h-6.5 shrink-0 items-center justify-between border-border/20 border-b bg-[#0f0f12] px-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-[10px] text-muted-foreground/50 tracking-tight">
              {title}
            </span>
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden bg-[#08080a]">
          <TerminalPlaceholder shellType="Local Shell" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border/30 bg-[#08080a] shadow-md transition-all duration-300 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 hover:shadow-lg">
      {/* Title Bar / Header */}
      <div className="flex h-6.5 shrink-0 items-center justify-between border-border/20 border-b bg-[#0f0f12] px-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[10px] text-muted-foreground/90 tracking-tight">
            {title}
          </span>
          <span
            className={`scale-90 rounded px-1.5 py-0.5 font-bold font-mono text-[8px] uppercase tracking-normal ${getBadgeColor(shellType)}`}
          >
            {shellType}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleClear}
            title="Clear Terminal Screen"
            type="button"
          >
            <Trash2 className="size-3" />
          </button>
          <button
            className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleReset}
            title="Reset Shell Session"
            type="button"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>

      {/* xterm.js Container / Animated Transition */}
      <div
        className="relative flex-1 overflow-hidden bg-[#08080a]"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence initial={false}>
          {!isTerminalReady && (
            <motion.div
              className="absolute inset-0 z-10"
              exit={{
                opacity: 0,
                scale: 0.99,
                y: -4,
              }}
              initial={{ opacity: 1 }}
              key="placeholder"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              <TerminalPlaceholder shellType={shellType} />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{
            opacity: isTerminalReady ? 1 : 0,
            y: isTerminalReady ? 0 : 8,
            scale: isTerminalReady ? 1 : 0.99,
          }}
          className="h-full w-full"
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 24,
            delay: 0.05,
          }}
        >
          {/* biome-ignore lint/a11y/useSemanticElements: xterm.js container is non-semantic */}
          <div
            aria-label={`${title} terminal`}
            className="h-full w-full p-1 focus:outline-none"
            ref={containerRef}
            role="textbox"
            tabIndex={0}
          />
        </motion.div>
      </div>
    </div>
  );
}
