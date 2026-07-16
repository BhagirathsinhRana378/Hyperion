"use client";

import { KanbanBoard } from "@workspace/core/components/kanban/kanban-board";

export function KanbanPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-xl tracking-tight">Task Board</h1>
          <p className="text-muted-foreground text-sm">
            Drag and drop tasks across columns
          </p>
        </div>
      </div>
      <div className="flex flex-1 overflow-x-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
