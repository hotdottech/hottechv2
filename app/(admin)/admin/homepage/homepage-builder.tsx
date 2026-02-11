"use client";

import { useState } from "react";
import { updateHomepageLayout } from "@/lib/actions/settings";
import type { HomepageBlock } from "@/lib/types";
import { HeroEditor } from "@/app/components/admin/blocks/hero-editor";
import { FeatureGridEditor } from "@/app/components/admin/blocks/feature-grid-editor";

type HomepageBuilderProps = {
  initialLayout: HomepageBlock[];
};

export function HomepageBuilder({ initialLayout }: HomepageBuilderProps) {
  const [layout, setLayout] = useState<HomepageBlock[]>(initialLayout);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function updateBlockData(blockId: string, data: unknown) {
    setLayout((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, data } : b
      )
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await updateHomepageLayout(layout);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-sans text-sm text-gray-400">
          {layout.length} block{layout.length !== 1 ? "s" : ""} in layout
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-gray hover:bg-hot-white/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 font-sans text-sm text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p className="font-sans text-sm text-green-400">Changes saved.</p>
      )}

      <ul className="space-y-4">
        {layout.map((block) => (
          <li key={block.id}>
            {block.type === "hero" ? (
              <HeroEditor
                block={block}
                onChange={(data) => updateBlockData(block.id, data)}
              />
            ) : block.type === "feature_grid" ? (
              <FeatureGridEditor
                block={block}
                onChange={(data) => updateBlockData(block.id, data)}
              />
            ) : (
              <div className="rounded-lg border border-white/10 bg-hot-gray/50 p-4">
                <span className="font-sans text-sm text-gray-400">
                  {block.type} (id: {block.id})
                </span>
                <span className="ml-2 font-sans text-xs text-gray-500">
                  — editor coming later
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
