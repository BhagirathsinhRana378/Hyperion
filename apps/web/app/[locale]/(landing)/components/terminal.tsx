"use client";

import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import type * as React from "react";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TextType from "./text-type";

/* ─────────────────────────────────────────────────────────────
   Terminal — the site's one shared terminal window, built from
   three reusable pieces:

     TerminalHeader  — The macOS style header with traffic lights,
                       title, context shell label and border.
     TerminalContent — The viewport wrapper for terminal lines.
                       Uses overflow-hidden to prevent internal scrollbars
                       but automatically keeps scrolled to the bottom.
     TerminalTyping  — TextType preconfigured with Hyperion's
                       terminal cadence.
 ──────────────────────────────────────────────────────────── */

export type TerminalLineStatus = "success" | "warning" | "error" | "info";

export interface TerminalLineData {
  status?: TerminalLineStatus;
  text: string;
}

export type TerminalLineInput = string | TerminalLineData;

const STATUS_GLYPH: Record<TerminalLineStatus, string> = {
  success: "✓",
  warning: "!",
  error: "✗",
  info: "→",
};

const STATUS_CLASS: Record<TerminalLineStatus, string> = {
  success: "text-[#8bbf93]",
  warning: "text-[#cca868]",
  error: "text-[#c98a7f]",
  info: "text-muted-foreground",
};

const CHAR_MS = 45;
const LINE_PAUSE_MS = 1000;
const BLANK_LINE_MS = 250;

function estimateDuration(text: string) {
  return text.length * CHAR_MS + LINE_PAUSE_MS;
}

// ─── Reusable Terminal Header Component ───
export interface TerminalHeaderProps {
  shell?: string;
  title?: string;
}

export function TerminalHeader({ title, shell = "zsh" }: TerminalHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-border border-b bg-muted/30 px-4 py-2.5">
      <span aria-hidden={true} className="size-2.5 rounded-full bg-[#ec6a5e]" />
      <span aria-hidden={true} className="size-2.5 rounded-full bg-[#f4bf4f]" />
      <span aria-hidden={true} className="size-2.5 rounded-full bg-[#61c454]" />
      {title && (
        <span className="ml-2 truncate font-mono text-muted-foreground text-xs">
          {title}
        </span>
      )}
      <span className="ml-auto shrink-0 font-mono text-muted-foreground text-xs">
        {shell}
      </span>
    </div>
  );
}

// ─── Reusable Terminal Content Component ───
export interface TerminalContentProps extends React.ComponentProps<"div"> {
  bodyRef?: React.RefObject<HTMLDivElement | null>;
}

export function TerminalContent({
  children,
  className,
  bodyRef,
  ...props
}: TerminalContentProps) {
  return (
    <div
      className={cn(
        "landing-terminal-scroll flex-1 overflow-x-hidden overflow-y-auto p-4",
        className
      )}
      ref={bodyRef}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Reusable Terminal Typing Component ───
export interface TerminalTypingProps {
  className?: string;
  delay?: number;
  loop?: boolean;
  showCursor?: boolean;
  text: string;
}

export function TerminalTyping({
  text,
  delay = 0,
  className,
  showCursor = true,
  loop = false,
}: TerminalTypingProps) {
  return (
    <TextType
      as="span"
      className={className}
      cursorBlinkDuration={0.6}
      cursorCharacter="▋"
      cursorClassName="ml-0.5 text-primary/80 font-mono"
      deletingSpeed={25}
      hideCursorWhileTyping={false}
      initialDelay={delay}
      loop={loop}
      pauseDuration={1000}
      showCursor={showCursor}
      startOnVisible={true}
      text={text}
      typingSpeed={45}
      variableSpeed={{ min: 25, max: 70 }}
    />
  );
}

// ─── Terminal Line Component ───
export function TerminalLine({
  line,
  typing,
  delay = 0,
  isLast = false,
}: {
  line: TerminalLineInput;
  typing: boolean;
  delay?: number;
  isLast?: boolean;
}) {
  const data: TerminalLineData =
    typeof line === "string" ? { text: line } : line;
  const [started, setStarted] = useState(!typing);
  const [finished, setFinished] = useState(!typing);

  useEffect(() => {
    if (!typing) {
      setStarted(true);
      setFinished(true);
      return;
    }
    setStarted(false);
    setFinished(false);
    const startTimer = setTimeout(() => setStarted(true), delay);
    const finishTimer = setTimeout(
      () => setFinished(true),
      delay + data.text.length * CHAR_MS + 150
    );
    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [typing, delay, data.text]);

  if (data.text === "") {
    return <div aria-hidden={true} className="h-3" />;
  }

  if (!started) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 py-0.5">
      {data.status && (
        <span
          className={cn(
            "mt-px shrink-0 font-semibold",
            STATUS_CLASS[data.status]
          )}
        >
          {STATUS_GLYPH[data.status]}
        </span>
      )}
      {typing ? (
        <TerminalTyping showCursor={isLast || !finished} text={data.text} />
      ) : (
        <span>
          {data.text}
          {isLast && (
            <span
              className="landing-caret-blink ml-0.5 inline-block font-mono text-primary/80"
              style={{ "--caret-dur": "1.2s" } as CSSProperties}
            >
              ▋
            </span>
          )}
        </span>
      )}
    </div>
  );
}

interface TerminalProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** One static or typed block — for real file dumps (config, SDK
   *  usage) where per-line status glyphs don't make sense. */
  code?: string;
  /** Structured CLI session — command + status log, each line typed
   *  in sequence. Use for genuine terminal sessions. */
  lines?: TerminalLineInput[];
  /** Bump to force the whole `lines` sequence to replay from scratch. */
  replayKey?: number;
  /** Right-aligned context label, e.g. "zsh", "shell", "typescript". */
  shell?: string;
  /** Left-aligned window title, next to the traffic lights. */
  title?: string;
  typing?: boolean;
}

export function Terminal({
  className,
  title,
  shell = "zsh",
  lines,
  code,
  typing = false,
  replayKey = 0,
  children,
  ...props
}: TerminalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const reduceMotion = useReducedMotion();
  const animate = typing && !reduceMotion;

  const lineDelays = useMemo(() => {
    if (!lines) {
      return [];
    }
    let running = 0;
    return lines.map((line) => {
      const text = typeof line === "string" ? line : line.text;
      const delay = running;
      running += text === "" ? BLANK_LINE_MS : estimateDuration(text);
      return delay;
    });
  }, [lines]);

  // Auto-scroll: keep pinned to the newest line while output grows, but
  // only while the visitor hasn't manually scrolled up — pinnedRef is
  // the source of truth, flipped by the body's own onScroll below.
  useEffect(() => {
    const el = bodyRef.current;
    if (!(el && animate)) {
      return;
    }
    const observer = new MutationObserver(() => {
      if (pinnedRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
    observer.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [animate]);

  return (
    <Reveal className={className} direction="up" duration={350} offset={32}>
      <div
        className="mx-auto flex h-[360px] w-full max-w-[1000px] flex-col overflow-hidden rounded-xl border border-border bg-card/60 shadow-2xl shadow-black/40 backdrop-blur-sm md:h-[440px] lg:h-[500px]"
        data-slot="terminal"
        {...props}
      >
        <TerminalHeader shell={shell} title={title} />
        <TerminalContent
          bodyRef={bodyRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            pinnedRef.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 32;
          }}
        >
          {children ??
            (lines ? (
              <div
                className="font-mono text-foreground/85 text-sm"
                key={replayKey}
              >
                {lines.map((line, i) => (
                  <TerminalLine
                    delay={lineDelays[i]}
                    isLast={i === lines.length - 1}
                    // biome-ignore lint/suspicious/noArrayIndexKey: line order is static per Terminal instance, never reordered at runtime
                    key={i}
                    line={line}
                    typing={animate}
                  />
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-foreground/85 text-sm leading-relaxed">
                {animate && code ? (
                  <TerminalTyping text={code} />
                ) : (
                  <code>
                    {code}
                    <span
                      className="landing-caret-blink ml-0.5 inline-block font-mono text-primary/80"
                      style={{ "--caret-dur": "1.2s" } as CSSProperties}
                    >
                      ▋
                    </span>
                  </code>
                )}
              </pre>
            ))}
        </TerminalContent>
      </div>
    </Reveal>
  );
}
