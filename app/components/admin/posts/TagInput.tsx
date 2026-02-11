"use client";

import { useState, useRef, useEffect } from "react";

export type TagOption = { id: number; name: string };
export type SelectedTag = { id: number; name: string; isNew?: boolean };

type Props = {
  availableTags: TagOption[];
  selectedTags: SelectedTag[];
  onChange: (tags: SelectedTag[]) => void;
};

export function TagInput({ availableTags, selectedTags, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selectedTags.map((t) => t.id));
  const selectedNamesLower = new Set(selectedTags.map((t) => (t.name ?? "").toLowerCase().trim()));
  const matching = inputValue.trim()
    ? availableTags.filter((t) => {
        const name = (t.name ?? "").toLowerCase();
        const slug = (t as { slug?: string }).slug?.toLowerCase() ?? "";
        const q = inputValue.toLowerCase().trim();
        return (name.includes(q) || slug.includes(q)) && !selectedIds.has(t.id);
      })
    : [];
  const exactMatch = inputValue.trim()
    ? availableTags.find(
        (t) => (t.name ?? "").toLowerCase().trim() === inputValue.toLowerCase().trim()
      )
    : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function removeTag(tag: SelectedTag) {
    onChange(selectedTags.filter((t) => t.id !== tag.id || t.name !== tag.name));
  }

  function addTag(tag: TagOption | SelectedTag) {
    if (selectedIds.has(tag.id) && !(tag as SelectedTag).isNew) return;
    if (selectedNamesLower.has((tag.name ?? "").toLowerCase().trim())) return;
    onChange([...selectedTags, { ...tag, isNew: (tag as SelectedTag).isNew }]);
    setInputValue("");
    setShowDropdown(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) return;
      if (exactMatch) {
        addTag(exactMatch);
        return;
      }
      addTag({ id: -1, name: trimmed, isNew: true });
    }
    if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      onChange(selectedTags.slice(0, -1));
    }
  }

  return (
    <div ref={containerRef} className="relative isolate">
      <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-md border border-white/10 bg-hot-black px-3 py-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id === -1 ? `new-${tag.name}` : tag.id}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-sans text-xs text-hot-white"
          >
            {tag.name}
            {tag.isNew && (
              <span className="text-gray-400" title="New (will be created on save)">
                +
              </span>
            )}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded p-0.5 hover:bg-white/20"
              aria-label={`Remove ${tag.name}`}
            >
              <span className="text-gray-400 hover:text-hot-white">×</span>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter or , to add"
          className="min-w-[120px] flex-1 shrink-0 border-0 bg-transparent px-0 py-1 font-sans text-sm text-hot-white placeholder-gray-500 focus:outline-none focus:ring-0"
        />
      </div>
      {showDropdown && matching.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-white/20 bg-hot-black py-1 shadow-xl">
          {matching.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left font-sans text-sm text-hot-white hover:bg-white/10"
                onClick={() => addTag(t)}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
