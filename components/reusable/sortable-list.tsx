"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

type Item = { id: number };

// A vertical list reordered by dragging a handle (or by keyboard: Space to
// pick up, arrows to move, Space to drop). The new order shows right away;
// onReorder saves it and returns false to put the old order back
export default function SortableList<T extends Item>({
  id,
  items,
  onReorder,
  renderItem,
  handleLabel,
  handleClassName,
  className,
}: {
  // Fixed, so dnd-kit's aria ids match between server and browser
  id: string;
  items: T[];
  onReorder: (ids: number[]) => Promise<boolean>;
  // `handle` goes wherever the item wants its drag handle
  renderItem: (
    item: T,
    handle: React.ReactNode,
    index: number,
  ) => React.ReactNode;
  handleLabel: (item: T) => string;
  handleClassName?: string;
  className?: string;
}) {
  // The order on screen, ahead of the server while a reorder saves
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  // A different set or order of ids from the server (added, deleted,
  // reordered) wins. Compared by ids, since callers build a new array on
  // every render
  const itemsKey = items.map((item) => item.id).join(",");
  const [previousKey, setPreviousKey] = useState(itemsKey);
  if (itemsKey !== previousKey) {
    setPreviousKey(itemsKey);
    setOrder(items.map((item) => item.id));
  }

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = order.flatMap((itemId) => byId.get(itemId) ?? []);

  const sensors = useSensors(
    // A small move before dragging starts, so a click on the handle is a click
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const move = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const before = order;
    const next = arrayMove(
      order,
      order.indexOf(Number(active.id)),
      order.indexOf(Number(over.id)),
    );
    setOrder(next);

    if (!(await onReorder(next))) setOrder(before);
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={move}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <ul className={cn("flex flex-col gap-2", className)}>
          {ordered.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              label={handleLabel(item)}
              handleClassName={handleClassName}
            >
              {(handle) => renderItem(item, handle, index)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  label,
  handleClassName,
  children,
}: {
  id: number;
  label: string;
  handleClassName?: string;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10 opacity-80 shadow-lg")}
    >
      {children(
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={label}
          className={cn(
            "flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/60 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-secondary/40 active:cursor-grabbing",
            handleClassName,
          )}
        >
          <GripVertical className="size-4" />
        </button>,
      )}
    </li>
  );
}
