"use client";

import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "@workspace/core/components/kanban/kanban-column";
import { useKanbanStore } from "@workspace/core/stores/kanban-store";
import { useState } from "react";

export function KanbanBoard() {
  const { addColumn, cards, columns, deleteColumn, moveCard } =
    useKanbanStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeCard = cards.find((c) => c.id === String(active.id));
    if (!activeCard) {
      return;
    }

    const overColumn = columns.find((col) => col.id === String(over.id));
    const overCard = cards.find((c) => c.id === String(over.id));

    if (overColumn) {
      if (activeCard.columnId !== overColumn.id) {
        const columnCards = cards.filter((c) => c.columnId === overColumn.id);
        moveCard(activeCard.id, overColumn.id, columnCards.length);
      }
    } else if (overCard && activeCard.columnId !== overCard.columnId) {
      const columnCards = cards.filter((c) => c.columnId === overCard.columnId);
      const overIndex = columnCards.findIndex((c) => c.id === overCard.id);
      moveCard(activeCard.id, overCard.columnId, overIndex);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const activeCard = cards.find((c) => c.id === String(active.id));
    const overCard = cards.find((c) => c.id === String(over.id));

    if (activeCard && overCard && activeCard.columnId === overCard.columnId) {
      const columnCards = cards.filter(
        (c) => c.columnId === activeCard.columnId
      );
      const oldIndex = columnCards.findIndex((c) => c.id === activeCard.id);
      const newIndex = columnCards.findIndex((c) => c.id === overCard.id);

      if (oldIndex !== newIndex) {
        moveCard(activeCard.id, activeCard.columnId, newIndex);
      }
    }
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <SortableContext
        items={columns.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex gap-4 overflow-x-auto p-4">
          {columns.map((column) => (
            <KanbanColumn
              column={column}
              key={column.id}
              onDeleteColumn={deleteColumn}
            />
          ))}
          <button
            className="flex h-fit w-72 shrink-0 items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-8 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => addColumn("New Column")}
            type="button"
          >
            + Add Column
          </button>
        </div>
      </SortableContext>

      <DragOverlay>
        {activeCard ? (
          <div className="w-72 rounded-md border bg-background p-2 opacity-90 shadow-lg">
            <p className="font-medium text-sm">{activeCard.title}</p>
            {activeCard.description && (
              <p className="text-muted-foreground text-xs">
                {activeCard.description}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
