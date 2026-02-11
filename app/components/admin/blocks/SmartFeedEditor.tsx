"use client";

import type { HomepageBlock } from "@/lib/types";
import type { SmartFeedBlockData } from "@/lib/types";
import type { CategoryRow } from "@/lib/actions/categories";
import type { TagRow } from "@/lib/actions/tags";
import type { ContentTypeRow } from "@/lib/actions/content-types";

type Taxonomies = {
  categories: CategoryRow[];
  tags: TagRow[];
  contentTypes: ContentTypeRow[];
};

type SmartFeedEditorProps = {
  block: HomepageBlock;
  onChange: (data: SmartFeedBlockData) => void;
  taxonomies: Taxonomies;
};

const emptyData: SmartFeedBlockData = {
  title: "",
  categoryId: null,
  tagId: null,
  typeId: null,
  limit: 6,
};

const LIMIT_OPTIONS = [3, 6, 9, 12, 15];

export function SmartFeedEditor({
  block,
  onChange,
  taxonomies,
}: SmartFeedEditorProps) {
  const data = (block.data as SmartFeedBlockData | undefined) ?? emptyData;
  const { categories, tags, contentTypes } = taxonomies;

  function update<K extends keyof SmartFeedBlockData>(
    key: K,
    value: SmartFeedBlockData[K]
  ) {
    onChange({ ...data, [key]: value });
  }

  const limit = typeof data.limit === "number" ? data.limit : 6;

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-hot-gray/50 p-4">
      <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-gray-400">
        Smart Feed Block
      </h3>
      <div className="grid gap-4 sm:grid-cols-1">
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Title
          </label>
          <input
            type="text"
            value={data.title ?? ""}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Latest Reviews"
            className="mt-1 w-full rounded-md border border-white/10 bg-hot-gray px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          />
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Content Type
          </label>
          <select
            value={data.typeId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              update("typeId", v === "" ? null : parseInt(v, 10));
            }}
            className="mt-1 w-full rounded-md border border-white/10 bg-hot-gray px-3 py-2 font-sans text-hot-white focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          >
            <option value="">All</option>
            {contentTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name ?? ct.slug ?? ct.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Category
          </label>
          <select
            value={data.categoryId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              update("categoryId", v === "" ? null : parseInt(v, 10));
            }}
            className="mt-1 w-full rounded-md border border-white/10 bg-hot-gray px-3 py-2 font-sans text-hot-white focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ?? c.slug ?? c.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Tag
          </label>
          <select
            value={data.tagId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              update("tagId", v === "" ? null : parseInt(v, 10));
            }}
            className="mt-1 w-full rounded-md border border-white/10 bg-hot-gray px-3 py-2 font-sans text-hot-white focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          >
            <option value="">All</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name ?? t.slug ?? t.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => update("limit", parseInt(e.target.value, 10))}
            className="mt-1 w-full rounded-md border border-white/10 bg-hot-gray px-3 py-2 font-sans text-hot-white focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
