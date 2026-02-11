"use client";

import type { HomepageBlock } from "@/lib/types";
import type { FeatureGridBlockData } from "@/lib/types";
import { PostPicker } from "./post-picker";

type FeatureGridEditorProps = {
  block: HomepageBlock;
  onChange: (data: FeatureGridBlockData) => void;
};

const emptyData: FeatureGridBlockData = {
  sectionTitle: "",
  postIds: [],
};

export function FeatureGridEditor({ block, onChange }: FeatureGridEditorProps) {
  const data = (block.data as FeatureGridBlockData | undefined) ?? emptyData;
  const sectionTitle = data.sectionTitle ?? "";
  const postIds = Array.isArray(data.postIds) ? data.postIds : [];

  function update(partial: Partial<FeatureGridBlockData>) {
    onChange({ ...data, ...partial });
  }

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-hot-gray/50 p-4">
      <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-gray-400">
        Feature Grid Block
      </h3>
      <div className="grid gap-4 sm:grid-cols-1">
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Section Title (optional)
          </label>
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => update({ sectionTitle: e.target.value })}
            placeholder="e.g. Featured"
            className="mt-1 w-full rounded-md border border-white/10 bg-hot-gray px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          />
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Posts
          </label>
          <div className="mt-1">
            <PostPicker
              selectedIds={postIds}
              onChange={(ids) => update({ postIds: ids })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
