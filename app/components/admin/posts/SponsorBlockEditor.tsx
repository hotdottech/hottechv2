"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { UniversalImagePicker } from "@/app/components/admin/shared/UniversalImagePicker";
import type { SponsorBlockData, SponsorItem } from "@/lib/types/post";
import { DEFAULT_SPONSOR_BLOCK_DATA } from "@/lib/types/post";

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `sponsor-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyItem(): SponsorItem {
  return {
    id: generateId(),
    imageUrl: "",
    linkUrl: "",
    altText: "",
    partnerLabel: "",
  };
}

type SponsorBlockEditorProps = {
  value: SponsorBlockData | null | undefined;
  onChange: (data: SponsorBlockData) => void;
};

const TITLE_TAGS: { value: SponsorBlockData["titleTag"]; label: string }[] = [
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "h4", label: "H4" },
  { value: "p", label: "P" },
];

const TITLE_COLORS: { value: SponsorBlockData["titleColor"]; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "primary", label: "Primary" },
  { value: "muted", label: "Muted" },
  { value: "gold", label: "Gold" },
  { value: "red", label: "Red" },
];

const COLUMNS_OPTIONS = ["1", "2", "3", "4", "5", "6"] as const;
const SIZE_OPTIONS: { value: SponsorBlockData["size"]; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];
const ALIGN_OPTIONS: { value: SponsorBlockData["alignment"]; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export function SponsorBlockEditor({ value, onChange }: SponsorBlockEditorProps) {
  const data: SponsorBlockData = value ?? DEFAULT_SPONSOR_BLOCK_DATA;

  const update = useCallback(
    (partial: Partial<SponsorBlockData>) => {
      onChange({ ...data, ...partial });
    },
    [data, onChange]
  );

  const addItem = useCallback(() => {
    update({ items: [...data.items, emptyItem()] });
  }, [data.items, update]);

  const updateItem = useCallback(
    (index: number, partial: Partial<SponsorItem>) => {
      const next = [...data.items];
      next[index] = { ...next[index], ...partial };
      update({ items: next });
    },
    [data.items, update]
  );

  const removeItem = useCallback(
    (index: number) => {
      update({ items: data.items.filter((_, i) => i !== index) });
    },
    [data.items, update]
  );

  return (
    <div className="space-y-6 rounded-lg border border-white/10 bg-hot-black/50 p-4">
      <h3 className="font-sans text-sm font-medium text-hot-white">
        Sponsor Block
      </h3>

      {/* Global settings */}
      <div className="space-y-4">
        <div>
          <label className="block font-sans text-xs text-gray-500">Title</label>
          <input
            type="text"
            value={data.title ?? ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Event Partners"
            className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-sans text-xs text-gray-500">
              Title Tag
            </label>
            <select
              value={data.titleTag}
              onChange={(e) =>
                update({ titleTag: e.target.value as SponsorBlockData["titleTag"] })
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
            >
              {TITLE_TAGS.map(({ value: v, label }) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-sans text-xs text-gray-500">
              Title Color
            </label>
            <select
              value={data.titleColor}
              onChange={(e) =>
                update({
                  titleColor: e.target.value as SponsorBlockData["titleColor"],
                })
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
            >
              {TITLE_COLORS.map(({ value: v, label }) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-sans text-xs text-gray-500">
              Columns
            </label>
            <select
              value={data.columns}
              onChange={(e) =>
                update({
                  columns: e.target.value as SponsorBlockData["columns"],
                })
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
            >
              {COLUMNS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-sans text-xs text-gray-500">Size</label>
            <select
              value={data.size}
              onChange={(e) =>
                update({ size: e.target.value as SponsorBlockData["size"] })
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
            >
              {SIZE_OPTIONS.map(({ value: v, label }) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block font-sans text-xs text-gray-500">Align</label>
          <div className="mt-1.5 flex gap-2">
            {ALIGN_OPTIONS.map(({ value: v, label }) => (
              <button
                key={v}
                type="button"
                onClick={() => update({ alignment: v })}
                className={`rounded-md border px-3 py-1.5 font-sans text-xs transition-colors ${
                  data.alignment === v
                    ? "border-hot-white/40 bg-white/10 text-hot-white"
                    : "border-white/10 text-gray-400 hover:bg-white/5 hover:text-hot-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 font-sans text-sm text-hot-white">
          <input
            type="checkbox"
            checked={data.grayscale}
            onChange={(e) => update({ grayscale: e.target.checked })}
            className="rounded border-white/20 bg-hot-black text-hot-white focus:ring-0"
          />
          Grayscale logos until hover
        </label>
      </div>

      {/* Sponsor list */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block font-sans text-xs text-gray-500">
            Sponsors / Partners
          </label>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 font-sans text-sm text-hot-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="mt-3 space-y-4">
          {data.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-md border border-white/10 bg-hot-black/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-sans text-xs text-gray-500">
                  Logo {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded p-1 text-gray-500 hover:bg-red-500/20 hover:text-red-400"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <UniversalImagePicker
                  label="Logo"
                  value={item.imageUrl || null}
                  onChange={(url) => updateItem(index, { imageUrl: url || "" })}
                />
                <div>
                  <label className="block font-sans text-xs text-gray-500">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={item.linkUrl ?? ""}
                    onChange={(e) =>
                      updateItem(index, { linkUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-gray-500">
                    Label
                  </label>
                  <input
                    type="text"
                    value={item.partnerLabel ?? ""}
                    onChange={(e) =>
                      updateItem(index, { partnerLabel: e.target.value })
                    }
                    placeholder="e.g. Official TV Partner"
                    className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-gray-500">
                    Alt text (optional)
                  </label>
                  <input
                    type="text"
                    value={item.altText ?? ""}
                    onChange={(e) =>
                      updateItem(index, { altText: e.target.value })
                    }
                    placeholder="Company name"
                    className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {data.items.length === 0 && (
          <p className="mt-2 font-sans text-sm text-gray-500">
            No sponsors yet. Click Add to add a logo.
          </p>
        )}
      </div>
    </div>
  );
}
