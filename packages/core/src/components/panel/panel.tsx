"use client";

import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type React from "react";
import { useEffect } from "react";

interface PanelProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Panel({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: PanelProps) {
  const prefersReducedMotion = useReducedMotion();

  // Escape key listener
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Motion variants for overlay
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // Motion variants for panel container
  const containerVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: "spring", duration: 0.4, bounce: 0.1 },
        },
        exit: {
          opacity: 0,
          scale: 0.95,
          y: 15,
          transition: { duration: 0.25, ease: "easeInOut" },
        },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          {/* Backdrop Blur Overlay */}
          <motion.div
            animate="visible"
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            exit="hidden"
            initial="hidden"
            onClick={onClose}
            variants={overlayVariants}
          />

          {/* Centered Panel Window */}
          <motion.div
            animate="visible"
            className="relative flex h-[700px] max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/85 shadow-2xl backdrop-blur-2xl"
            exit="exit"
            initial="hidden"
            variants={containerVariants}
          >
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-border/40 border-b bg-background/50 px-6 backdrop-blur-md">
              <div className="font-bold text-foreground text-lg tracking-tight font-sans">
                {title}
              </div>
              <Button
                aria-label="Close panel"
                className="size-8 rounded-lg hover:bg-muted"
                onClick={onClose}
                size="icon"
                variant="ghost"
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </header>

            {/* Scrollable Body */}
            <div className="no-scrollbar flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Sticky Footer (Optional) */}
            {footer && (
              <footer className="sticky bottom-0 z-10 flex h-14 shrink-0 items-center justify-end border-border/40 border-t bg-background/30 px-6 backdrop-blur-md">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
