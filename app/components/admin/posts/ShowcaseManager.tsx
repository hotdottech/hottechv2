"use client";

import { useState, useCallback } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Copy } from "lucide-react";
import { UniversalImagePicker } from "@/app/components/admin/shared/UniversalImagePicker";

export const BADGE_COLORS = [
  { value: "gray", label: "Gray", classes: "bg-gray-500 text-white" },
  { value: "gold", label: "Gold", classes: "bg-yellow-500 text-black" },
  { value: "silver", label: "Silver", classes: "bg-slate-300 text-black" },
  { value: "bronze", label: "Bronze", classes: "bg-orange-700 text-white" },
  { value: "red", label: "Red", classes: "bg-red-600 text-white" },
  { value: "blue", label: "Blue", classes: "bg-blue-600 text-white" },
  { value: "green", label: "Green", classes: "bg-green-600 text-white" },
  { value: "black", label: "Black", classes: "bg-black text-white" },
] as const;

export type ShowcaseItem = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge?: string;
  badge_color?: string;
  hide_title?: boolean;
  link?: string;
  description?: string;
};

type ShowcaseManagerProps = {
  items: ShowcaseItem[];
  onChange: (items: ShowcaseItem[]) => void;
  type: "people" | "products";
  displayOptions?: Record<string, unknown>;
  onDisplayOptionsChange?: (options: Record<string, unknown>) => void;
};

function generateId(): string {
  return `showcase-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const emptyItem: Omit<ShowcaseItem, "id"> = {
  image: "",
  title: "",
  subtitle: "",
  badge: "",
  badge_color: "gray",
  hide_title: false,
  link: "",
  description: "",
};

export function ShowcaseManager({ items, onChange, type, displayOptions = {}, onDisplayOptionsChange }: ShowcaseManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ShowcaseItem>({ ...emptyItem, id: generateId() });

  const openAdd = useCallback(() => {
    setForm({ ...emptyItem, id: generateId() });
    setEditingIndex(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((index: number) => {
    const item = items[index];
    if (item) {
      setForm({ ...item });
      setEditingIndex(index);
      setModalOpen(true);
    }
  }, [items]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingIndex(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.title?.trim()) return;
    const next: ShowcaseItem = {
      ...form,
      title: form.title.trim(),
      subtitle: (form.subtitle ?? "").trim(),
      badge: form.badge?.trim() || undefined,
      badge_color: form.badge_color ?? "gray",
      hide_title: form.hide_title ?? false,
      link: form.link?.trim() || undefined,
      description: form.description?.trim() || undefined,
      image: form.image?.trim() || "",
    };
    if (editingIndex !== null) {
      const nextItems = [...items];
      nextItems[editingIndex] = next;
      onChange(nextItems);
    } else {
      onChange([...items, next]);
    }
    closeModal();
  }, [form, editingIndex, items, onChange, closeModal]);

  const remove = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  const move = useCallback((index: number, direction: "up" | "down") => {
    const next = [...items];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }, [items, onChange]);

  const duplicate = useCallback((index: number) => {
    const item = items[index];
    if (!item) return;
    const copy: ShowcaseItem = {
      ...item,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : generateId(),
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onChange(next);
  }, [items, onChange]);

  const hideShowcaseTitle = displayOptions?.hide_showcase_title === true;
  const setHideShowcaseTitle = useCallback(
    (value: boolean) => {
      onDisplayOptionsChange?.({ ...displayOptions, hide_showcase_title: value });
    },
    [displayOptions, onDisplayOptionsChange]
  );

  const gridColumns = Math.min(5, Math.max(3, Number(displayOptions?.grid_columns) || 3));
  const setGridColumns = useCallback(
    (value: number) => {
      onDisplayOptionsChange?.({ ...displayOptions, grid_columns: value });
    },
    [displayOptions, onDisplayOptionsChange]
  );

  const imageShape = (displayOptions?.image_shape as string) === "square" ? "square" : "circle";
  const setImageShape = useCallback(
    (value: "circle" | "square") => {
      onDisplayOptionsChange?.({ ...displayOptions, image_shape: value });
    },
    [displayOptions, onDisplayOptionsChange]
  );

  const label = type === "people" ? "People" : "Products";

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-hot-black/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-sans text-sm font-medium text-hot-white">
          Showcase: {label}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 font-sans text-sm text-hot-white">
            <input
              type="checkbox"
              checked={hideShowcaseTitle}
              onChange={(e) => setHideShowcaseTitle(e.target.checked)}
              className="rounded border-white/20 bg-hot-black text-hot-white focus:ring-0"
            />
            Hide Section Title
          </label>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs text-gray-500">Columns</span>
            <select
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value))}
              className="rounded border border-white/10 bg-hot-black px-2 py-1 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          {type === "people" && (
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-gray-500">Image Style</span>
              <select
                value={imageShape}
                onChange={(e) => setImageShape(e.target.value as "circle" | "square")}
                className="rounded border border-white/10 bg-hot-black px-2 py-1 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 font-sans text-sm text-hot-white transition-colors hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="font-sans text-sm text-gray-500">
          No {label.toLowerCase()} yet. Click Add to add entries.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-white/10 bg-hot-black/30 p-2"
            >
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, "up")}
                  disabled={index === 0}
                  className="rounded p-0.5 text-gray-500 hover:text-hot-white disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, "down")}
                  disabled={index === items.length - 1}
                  className="rounded p-0.5 text-gray-500 hover:text-hot-white disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-medium text-hot-white">
                  {item.title || "Untitled"}
                </p>
                <p className="truncate font-sans text-xs text-gray-500">
                  {item.subtitle || "—"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => duplicate(index)}
                  className="rounded p-1.5 text-gray-500 hover:bg-white/10 hover:text-hot-white"
                  aria-label="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(index)}
                  className="rounded p-1.5 text-gray-500 hover:bg-white/10 hover:text-hot-white"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded p-1.5 text-gray-500 hover:bg-red-500/20 hover:text-red-400"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-hot-black p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-4 font-sans text-lg font-medium text-hot-white">
              {editingIndex !== null ? "Edit" : "Add"} {label.slice(0, -1)}
            </h4>
            <div className="space-y-4">
              <UniversalImagePicker
                label="Image"
                value={form.image || null}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              />
              <div>
                <label className="block font-sans text-xs text-gray-500">
                  Title (Name of {type === "people" ? "Person" : "Product"})
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={type === "people" ? "Full name" : "Product name"}
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-500">
                  Subtitle ({type === "people" ? "Job Title" : "Manufacturer"})
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder={type === "people" ? "Job title" : "Brand / manufacturer"}
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 font-sans text-sm">
                <input
                  type="checkbox"
                  checked={form.hide_title ?? false}
                  onChange={(e) => setForm((f) => ({ ...f, hide_title: e.target.checked }))}
                  className="rounded border-white/20 bg-hot-black text-hot-white focus:ring-0"
                />
                <span className="text-hot-white">Hide Title</span>
              </label>
              <div>
                <label className="block font-sans text-xs text-gray-500">
                  Badge (optional)
                </label>
                <input
                  type="text"
                  value={form.badge ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  placeholder="Winner, Finalist, Gold"
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-500">
                  Badge Color
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {BADGE_COLORS.map(({ value, label, classes }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, badge_color: value }))}
                      className={`rounded-md px-2.5 py-1 font-sans text-xs font-medium transition-opacity ${classes} ${(form.badge_color ?? "gray") === value ? "ring-2 ring-white ring-offset-2 ring-offset-hot-black" : "opacity-80 hover:opacity-100"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-500">
                  Link (external URL)
                </label>
                <input
                  type="url"
                  value={form.link ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="https://…"
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-500">
                  Description (why they won)
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                  rows={3}
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.title?.trim()}
                className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
