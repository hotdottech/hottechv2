"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateNavigation, type NavMenuItem } from "@/lib/actions/settings";
import type { CategoryRow } from "@/lib/actions/categories";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

type LinkType = "custom" | "category";

type Props = {
  initialItems: NavMenuItem[];
  categories: CategoryRow[];
};

export function MenuManager({ initialItems, categories }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<NavMenuItem[]>(initialItems);
  const [linkType, setLinkType] = useState<LinkType>("custom");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function moveUp(index: number) {
    if (index <= 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  }

  function moveDown(index: number) {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
  }

  function remove(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    const label = newLabel.trim();
    const url = newUrl.trim();
    if (!label || !url) return;
    const type = linkType === "category" ? "category" : "custom";
    setItems([...items, { label, url, type }]);
    setNewLabel("");
    setNewUrl("");
    setSelectedCategoryId("");
  }

  function handleCategorySelect(categoryId: string) {
    setSelectedCategoryId(categoryId);
    if (!categoryId) {
      setNewLabel("");
      setNewUrl("");
      return;
    }
    const cat = categories.find((c) => c.id === parseInt(categoryId, 10));
    if (cat) {
      setNewLabel(cat.name ?? "");
      setNewUrl(`/category/${cat.slug ?? ""}`);
    }
  }

  async function handleSave() {
    setError("");
    setMessage("");
    setSaving(true);
    const result = await updateNavigation(items);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage("Menu saved. Changes will appear on the site.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {message}
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 font-sans text-lg font-medium text-hot-white">
          Current menu items
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No items yet. Add one below.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={`${item.label}-${item.url}-${index}`}
                className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-hot-black/50 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-sm font-medium text-hot-white">
                    {item.label}
                  </span>
                  <span className="ml-2 truncate font-sans text-xs text-gray-400">
                    {item.url}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="rounded p-2 text-gray-400 hover:bg-white/10 hover:text-hot-white disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    className="rounded p-2 text-gray-400 hover:bg-white/10 hover:text-hot-white disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 font-sans text-lg font-medium text-hot-white">
          Add item
        </h2>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setLinkType("custom")}
            className={`rounded-md px-3 py-2 font-sans text-sm transition-colors ${
              linkType === "custom"
                ? "bg-white/15 text-hot-white"
                : "text-gray-400 hover:bg-white/10 hover:text-hot-white"
            }`}
          >
            Custom Link
          </button>
          <button
            type="button"
            onClick={() => setLinkType("category")}
            className={`rounded-md px-3 py-2 font-sans text-sm transition-colors ${
              linkType === "category"
                ? "bg-white/15 text-hot-white"
                : "text-gray-400 hover:bg-white/10 hover:text-hot-white"
            }`}
          >
            Category
          </button>
        </div>
        {linkType === "category" ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block font-sans text-xs text-gray-500">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-sans text-xs text-gray-500">
                  Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Category name"
                  className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-xs text-gray-500">
                  URL
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="/category/slug"
                  className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={!newLabel.trim() || !newUrl.trim()}
              className="rounded-md border border-white/20 bg-white/10 px-4 py-2 font-sans text-sm font-medium text-hot-white hover:bg-white/15 disabled:opacity-50"
            >
              Add to Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block font-sans text-xs text-gray-500">
                Label
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Google"
                className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block font-sans text-xs text-gray-500">
                URL
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://google.com"
                className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="rounded-md border border-white/20 bg-white/10 px-4 py-2 font-sans text-sm font-medium text-hot-white hover:bg-white/15"
            >
              Add to Menu
            </button>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-hot-white px-6 py-3 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
