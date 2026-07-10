"use client";

import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";
import { Reveal } from "./reveal";

interface CodeBlockProps extends React.ComponentProps<"div"> {
  header?: string;
  language?: string;
  code?: string;
  lines?: number;
}

export function CodeBlock({
  className,
  header,
  language = "python",
  code,
  lines = 6,
  children,
  ...props
}: CodeBlockProps) {
  const defaultCode = code ?? `def hello_world():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    hello_world()`;

  return (
    <Reveal direction="up" duration={350} offset={32}>
      <div
        className={cn("overflow-hidden rounded-md bg-mistral-surface-code", className)}
        data-slot="code-block"
        {...props}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-mistral-surface-code px-4 py-2">
          {/* Traffic light dots */}
          <span className="size-2.5 rounded-full bg-red-500/60" />
          <span className="size-2.5 rounded-full bg-yellow-500/60" />
          <span className="size-2.5 rounded-full bg-green-500/60" />
          {header && (
            <span className="ml-2 text-caption text-mistral-on-dark-muted">
              {header}
            </span>
          )}
          <span className="ml-auto text-caption text-mistral-on-dark-muted">
            {language}
          </span>
        </div>
        {/* Code content */}
        <div className="overflow-x-auto p-4">
          {children ?? (
            <pre className="font-code text-code-md text-mistral-on-dark leading-relaxed">
              <code>{defaultCode}</code>
            </pre>
          )}
        </div>
      </div>
    </Reveal>
  );
}
