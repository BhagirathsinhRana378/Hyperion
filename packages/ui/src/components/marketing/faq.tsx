"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type * as React from "react";
import { Reveal } from "./reveal";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps extends React.ComponentProps<"div"> {
  items: FAQItem[];
}

export function FAQ({ className, items, ...props }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("space-y-3", className)} data-slot="faq" {...props}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <Reveal direction="up" duration={200} index={index} key={index}>
            <div className="overflow-hidden rounded-md border-b border-mistral-hairline bg-mistral-canvas">
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left text-body-md-medium text-mistral-ink transition-colors duration-150 hover:bg-mistral-surface"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                type="button"
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <Minus className="size-4 shrink-0 text-mistral-steel" />
                ) : (
                  <Plus className="size-4 shrink-0 text-mistral-steel" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-96" : "max-h-0"
                )}
              >
                <p className="px-6 pb-5 text-body-md text-mistral-ink-tint leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
