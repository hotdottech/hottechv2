"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight, Trash2 } from "lucide-react";

type SortableBlockProps = {
  id: string;
  title: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
  children: React.ReactNode;
};

export function SortableBlock({
  id,
  title,
  isEnabled,
  onToggle,
  onRemove,
  children,
}: SortableBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-white/10 bg-hot-gray/50 overflow-hidden ${
        isDragging ? "z-50 opacity-90 shadow-xl" : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-hot-gray/70 px-3 py-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="touch-none cursor-grab rounded p-1 text-gray-400 hover:bg-white/10 hover:text-hot-white active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="min-w-0 flex-1 font-sans text-sm font-medium text-hot-white truncate">
          {title}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="font-sans text-xs text-gray-500">On</span>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 text-hot-white focus:ring-hot-white/20"
          />
        </label>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-hot-white"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
          aria-label="Remove block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  );
}
