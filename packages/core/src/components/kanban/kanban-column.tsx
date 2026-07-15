"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "@workspace/core/components/kanban/kanban-card";
import type { KanbanColumn as KanbanColumnType } from "@workspace/core/stores/kanban-store";
import { useKanbanStore } from "@workspace/core/stores/kanban-store";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onDeleteColumn: (id: string) => void;
}

export function KanbanColumn({ column, onDeleteColumn }: KanbanColumnProps) {
  const { addCard, cards, deleteCard } = useKanbanStore();
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const columnCards = cards.filter((c) => c.columnId === column.id);
  const cardIds = columnCards.map((c) => c.id);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const handleAddCard = () => {
    const title = newCardTitle.trim();
    if (!title) {
      return;
    }
    addCard(column.id, title);
    setNewCardTitle("");
    setIsAdding(false);
  };

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30 ${
        isOver ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="font-semibold text-sm font-sans">{column.title}</div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">
            {columnCards.length}
          </span>
          <button
            className="cursor-pointer"
            onClick={() => onDeleteColumn(column.id)}
            type="button"
          >
            <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        ref={setNodeRef}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {columnCards.map((card) => (
            <KanbanCard card={card} key={card.id} onDelete={deleteCard} />
          ))}
        </SortableContext>

        {isAdding ? (
          <div className="flex flex-col gap-1">
            <input
              autoFocus
              className="flex h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCard();
                }
                if (e.key === "Escape") {
                  setIsAdding(false);
                }
              }}
              placeholder="Card title..."
              value={newCardTitle}
            />
            <div className="flex gap-1">
              <button
                className="rounded bg-primary px-2 py-0.5 text-primary-foreground text-xs hover:bg-primary/90"
                onClick={handleAddCard}
                type="button"
              >
                Add
              </button>
              <button
                className="rounded px-2 py-0.5 text-muted-foreground text-xs hover:text-foreground"
                onClick={() => setIsAdding(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setIsAdding(true)}
            type="button"
          >
            <Plus className="size-3" />
            Add card
          </button>
        )}
      </div>
    </div>
  );
}
