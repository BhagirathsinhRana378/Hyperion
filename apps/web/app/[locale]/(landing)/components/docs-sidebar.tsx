"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export interface DocsSection {
  id: string;
  label: string;
}

interface DocsSidebarProps {
  activeId: string;
  onSectionClick: (id: string) => void;
  sections: DocsSection[];
}

export function DocsSidebar({
  sections,
  activeId,
  onSectionClick,
}: DocsSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [markerTop, setMarkerTop] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Position the 48px marker relative to the active menu item
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const activeItem = container.querySelector(
      `[data-sidebar-id="${activeId}"]`
    );
    if (activeItem) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const activeCenterY =
        itemRect.top - containerRect.top + itemRect.height / 2;
      setMarkerTop(activeCenterY - 24); // centers the 48px marker
    }
  }, [activeId]);

  // Proximity shifts: translate items near the pointer using GPU acceleration
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;

    const items =
      container.querySelectorAll<HTMLButtonElement>("[data-sidebar-id]");
    for (const item of items) {
      const itemRect = item.getBoundingClientRect();
      const itemCenterY = itemRect.top - rect.top + itemRect.height / 2;
      const distance = Math.abs(relativeY - itemCenterY);
      const proximityRadius = 120;
      if (distance < proximityRadius) {
        const ratio = 1 - distance / proximityRadius;
        const shift = ratio * ratio * 16; // maxShift: 16px
        item.style.transform = `translate3d(${shift}px, 0, 0)`;
      } else {
        item.style.transform = "";
      }
    }
  };

  const handleMouseLeave = () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const items =
      container.querySelectorAll<HTMLButtonElement>("[data-sidebar-id]");
    for (const item of items) {
      item.style.transform = "";
    }
  };

  return (
    <>
      {/* Desktop/Tablet Sticky Navigation */}
      <aside className="hidden w-52 shrink-0 lg:block">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: proximity tracker */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: proximity tracker */}
        <div
          className="relative sticky top-32"
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          ref={containerRef}
        >
          {/* Animated Accent Line Marker */}
          <div
            className="absolute left-0 w-[2px] bg-primary transition-all duration-300 ease-out"
            style={{
              height: "48px",
              transform: `translateY(${markerTop}px)`,
            }}
          />

          <nav className="space-y-[18px] pl-4">
            {sections.map((s) => {
              const isActive = activeId === s.id;
              return (
                <button
                  className={cn(
                    "block w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-sm transition-all duration-200 ease-out",
                    "transform-gpu font-mono tracking-tight will-change-transform",
                    isActive
                      ? "border-primary/80 border-l-2 bg-white/[0.03] pl-2.5 font-medium text-foreground backdrop-blur-sm"
                      : "text-muted-foreground/80 hover:text-foreground"
                  )}
                  data-sidebar-id={s.id}
                  key={s.id}
                  onClick={() => onSectionClick(s.id)}
                  style={{
                    transitionProperty:
                      "transform, background-color, color, border-color, padding",
                    transitionDuration: "120ms",
                  }}
                  type="button"
                >
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Floating Drawer Trigger */}
      <button
        aria-label="Toggle menu"
        className="fixed right-6 bottom-6 z-50 flex size-12 items-center justify-center rounded-full border border-border bg-neutral-950 text-foreground shadow-2xl transition-colors hover:bg-neutral-900 lg:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              animate={{ opacity: 0.6 }}
              className="fixed inset-0 z-40 bg-black/80 lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              animate={{ y: 0 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl border-border border-t bg-neutral-950 p-6 lg:hidden"
              exit={{ y: "100%" }}
              initial={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Jump to Section
                </h3>
                <button
                  aria-label="Close menu"
                  className="rounded-lg p-1 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="space-y-2 pb-6">
                {sections.map((s) => {
                  const isActive = activeId === s.id;
                  return (
                    <button
                      className={cn(
                        "block w-full rounded-xl px-4 py-3 text-left text-sm transition-colors duration-150",
                        isActive
                          ? "border-primary border-l-2 bg-white/[0.04] font-medium text-foreground"
                          : "text-muted-foreground/70 hover:bg-white/[0.02]"
                      )}
                      key={s.id}
                      onClick={() => {
                        onSectionClick(s.id);
                        setIsOpen(false);
                      }}
                      type="button"
                    >
                      {s.label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
