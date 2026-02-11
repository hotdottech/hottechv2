"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { updateHomepageLayout } from "@/lib/actions/settings";
import type { HomepageBlock, HomepageBlockType } from "@/lib/types";
import { HeroEditor } from "@/app/components/admin/blocks/hero-editor";
import { FeatureGridEditor } from "@/app/components/admin/blocks/feature-grid-editor";
import { TimelineEditor } from "@/app/components/admin/blocks/TimelineEditor";
import { SmartFeedEditor } from "@/app/components/admin/blocks/SmartFeedEditor";
import { SortableBlock } from "@/app/components/admin/blocks/SortableBlock";
import type { CategoryRow } from "@/lib/actions/categories";
import type { TagRow } from "@/lib/actions/tags";
import type { ContentTypeRow } from "@/lib/actions/content-types";

type Taxonomies = {
  categories: CategoryRow[];
  tags: TagRow[];
  contentTypes: ContentTypeRow[];
};

type HomepageBuilderProps = {
  initialLayout: HomepageBlock[];
  taxonomies: Taxonomies;
};

const BLOCK_TITLES: Record<HomepageBlockType, string> = {
  hero: "Hero Section",
  feature_grid: "Feature Grid",
  timeline: "Timeline",
  smart_feed: "Smart Feed",
};

function createBlock(type: HomepageBlockType): HomepageBlock {
  const id = `${type}-${Date.now()}`;
  const data =
    type === "timeline"
      ? { slides: [] }
      : type === "feature_grid"
        ? { sectionTitle: "", postIds: [] }
        : type === "smart_feed"
          ? { title: "", categoryId: null, tagId: null, typeId: null, limit: 6 }
          : {};
  return { id, type, enabled: true, data };
}

export function HomepageBuilder({ initialLayout, taxonomies }: HomepageBuilderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [layout, setLayout] = useState<HomepageBlock[]>(initialLayout);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLayout((prev) => {
      const ids = prev.map((b) => b.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
    setSaved(false);
  }, []);

  function updateBlockData(blockId: string, data: unknown) {
    setLayout((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, data } : b))
    );
    setSaved(false);
  }

  function toggleBlock(blockId: string, enabled: boolean) {
    setLayout((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, enabled } : b))
    );
    setSaved(false);
  }

  function removeBlock(blockId: string) {
    setLayout((prev) => prev.filter((b) => b.id !== blockId));
    setSaved(false);
  }

  function addBlock(type: HomepageBlockType) {
    setLayout((prev) => [...prev, createBlock(type)]);
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

  function renderBlockEditor(block: HomepageBlock) {
    switch (block.type) {
      case "hero":
        return (
          <HeroEditor
            block={block}
            onChange={(data) => updateBlockData(block.id, data)}
          />
        );
      case "feature_grid":
        return (
          <FeatureGridEditor
            block={block}
            onChange={(data) => updateBlockData(block.id, data)}
          />
        );
      case "timeline":
        return (
          <TimelineEditor
            block={block}
            onChange={(data) => updateBlockData(block.id, data)}
          />
        );
      case "smart_feed":
        return (
          <SmartFeedEditor
            block={block}
            onChange={(data) => updateBlockData(block.id, data)}
            taxonomies={taxonomies}
          />
        );
      default:
        return (
          <div className="rounded-lg border border-white/10 bg-hot-gray/50 p-4">
            <span className="font-sans text-sm text-gray-400">
              {block.type} (id: {block.id})
            </span>
          </div>
        );
    }
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-9 w-28 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-[calc(100vh-200px)] animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" style={{ minHeight: "400px" }}>
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

      <div className="flex flex-1 flex-col overflow-hidden">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={layout.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 overflow-y-auto max-h-[83vh] pb-24 pr-2 space-y-4">
              {layout.map((block) => (
                <SortableBlock
                  key={block.id}
                  id={block.id}
                  title={BLOCK_TITLES[block.type]}
                  isEnabled={block.enabled}
                  onToggle={(enabled) => toggleBlock(block.id, enabled)}
                  onRemove={() => removeBlock(block.id)}
                >
                  {renderBlockEditor(block)}
                </SortableBlock>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-4 shrink-0 border-t border-white/10 pt-4">
          <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wider text-gray-500">
            Add block
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addBlock("hero")}
              className="rounded-md border border-white/20 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
            >
              Add Hero
            </button>
            <button
              type="button"
              onClick={() => addBlock("feature_grid")}
              className="rounded-md border border-white/20 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
            >
              Add Grid
            </button>
            <button
              type="button"
              onClick={() => addBlock("timeline")}
              className="rounded-md border border-white/20 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
            >
              Add Timeline
            </button>
            <button
              type="button"
              onClick={() => addBlock("smart_feed")}
              className="rounded-md border border-white/20 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
            >
              Add Smart Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
