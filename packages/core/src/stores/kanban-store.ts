"use client";

import { safeUUID } from "@workspace/core/lib/uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface KanbanCard {
  columnId: string;
  createdAt: number;
  description: string;
  id: string;
  title: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
}

interface KanbanState {
  addCard: (
    columnId: string,
    title: string,
    description?: string
  ) => KanbanCard;
  addColumn: (title: string) => KanbanColumn;
  cards: KanbanCard[];
  columns: KanbanColumn[];
  deleteCard: (id: string) => void;
  deleteColumn: (id: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;
  reorderCards: (columnId: string, cardIds: string[]) => void;
  updateCard: (
    id: string,
    updates: Partial<Pick<KanbanCard, "description" | "title">>
  ) => void;
}

function generateId(): string {
  return safeUUID();
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, _get) => ({
      addCard: (columnId: string, title: string, description = "") => {
        const card: KanbanCard = {
          columnId,
          createdAt: Date.now(),
          description,
          id: generateId(),
          title,
        };
        set((state) => ({ cards: [...state.cards, card] }));
        return card;
      },
      addColumn: (title: string) => {
        const column: KanbanColumn = {
          id: generateId(),
          title,
        };
        set((state) => ({ columns: [...state.columns, column] }));
        return column;
      },
      cards: [],
      columns: DEFAULT_COLUMNS,
      deleteCard: (id: string) => {
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        }));
      },
      deleteColumn: (id: string) => {
        set((state) => ({
          cards: state.cards.filter((c) => c.columnId !== id),
          columns: state.columns.filter((col) => col.id !== id),
        }));
      },
      moveCard: (cardId: string, toColumnId: string, toIndex: number) => {
        set((state) => {
          const cards = [...state.cards];
          const cardIndex = cards.findIndex((c) => c.id === cardId);
          if (cardIndex === -1) {
            return state;
          }

          const card = cards[cardIndex] as KanbanCard;
          cards.splice(cardIndex, 1);
          cards.splice(toIndex, 0, { ...card, columnId: toColumnId });

          return { cards };
        });
      },
      reorderCards: (columnId: string, cardIds: string[]) => {
        set((state) => {
          const otherCards = state.cards.filter((c) => c.columnId !== columnId);
          const columnCards = cardIds
            .map((id) => state.cards.find((c) => c.id === id))
            .filter(Boolean) as KanbanCard[];
          return { cards: [...otherCards, ...columnCards] };
        });
      },
      updateCard: (
        id: string,
        updates: Partial<Pick<KanbanCard, "description" | "title">>
      ) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },
    }),
    {
      name: "hyperion-kanban",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
