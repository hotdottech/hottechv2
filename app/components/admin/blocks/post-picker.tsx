"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchPosts, getPostTitles } from "@/app/(admin)/admin/posts/actions";

type Props = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function PostPicker({ selectedIds, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; title: string | null }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSet = new Set(selectedIds);

  useEffect(() => {
    if (selectedIds.length === 0) return;
    getPostTitles(selectedIds).then((hits) => {
      setTitles((prev) => {
        const next = { ...prev };
        for (const h of hits) next[h.id] = h.title ?? h.id;
        return next;
      });
    });
  }, [selectedIds]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchPosts(query).then((hits) => {
      if (!cancelled) {
        setResults(hits);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addPost(id: string, title: string | null) {
    if (selectedSet.has(id)) return;
    onChange([...selectedIds, id]);
    setTitles((prev) => ({ ...prev, [id]: title ?? id }));
    setQuery("");
    setShowDropdown(false);
  }

  function removePost(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  function movePost(index: number, dir: -1 | 1) {
    const next = [...selectedIds];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }

  const filteredResults = results.filter((r) => !selectedSet.has(r.id));

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search posts by title…"
          className="w-full rounded-md border border-white/10 bg-hot-gray px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
        />
        {showDropdown && (query.trim() || loading) && (
          <ul className="absolute z-[100] mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-white/20 bg-hot-black py-1 shadow-xl">
            {loading ? (
              <li className="px-3 py-2 font-sans text-sm text-gray-400">Searching…</li>
            ) : filteredResults.length === 0 ? (
              <li className="px-3 py-2 font-sans text-sm text-gray-400">
                {query.trim() ? "No matching posts" : "Type to search"}
              </li>
            ) : (
              filteredResults.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left font-sans text-sm text-hot-white hover:bg-white/10"
                    onClick={() => addPost(r.id, r.title)}
                  >
                    {r.title ?? r.id}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {selectedIds.length > 0 && (
        <ul className="space-y-1">
          {selectedIds.map((id, index) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-hot-gray/50 px-2 py-1.5"
            >
              <span className="flex flex-1 font-sans text-sm text-hot-white">
                {titles[id] ?? id}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => movePost(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-hot-white disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => movePost(index, 1)}
                  disabled={index === selectedIds.length - 1}
                  className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-hot-white disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removePost(id)}
                  className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-red-400"
                  aria-label="Remove"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
