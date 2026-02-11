"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSubscribers } from "@/lib/actions/subscribers";
import type { Subscriber } from "@/lib/types";
import { format } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[], selectedSubscribers: { id: string; email: string; status: string }[]) => void;
  initialSelection: string[];
};

function initials(email: string): string {
  const part = email.split("@")[0] ?? "";
  const words = part.split(/[._-]/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] ?? "").toUpperCase() + (words[1][0] ?? "").toUpperCase();
  }
  return (part.slice(0, 2) ?? "?").toUpperCase();
}

export function SubscriberSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  initialSelection,
}: Props) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<Set<string>>(new Set(initialSelection));
  const [selectedMap, setSelectedMap] = useState<Map<string, Subscriber>>(new Map());

  const fetchSubscribers = useCallback(async (query: string) => {
    setLoading(true);
    const data = await getSubscribers(query || undefined);
    setSubscribers(data);
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelection(new Set(initialSelection));
    setSelectedMap(new Map());
    fetchSubscribers("").then((data) => {
      setSelectedMap((prev) => {
        const next = new Map(prev);
        const initialSet = new Set(initialSelection);
        (data ?? []).forEach((s) => {
          if (initialSet.has(s.id)) next.set(s.id, s);
        });
        return next;
      });
    });
  }, [isOpen, initialSelection, fetchSubscribers]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => fetchSubscribers(search), 200);
    return () => clearTimeout(t);
  }, [isOpen, search, fetchSubscribers]);

  useEffect(() => {
    setSelectedMap((prev) => {
      let next: Map<string, Subscriber> | null = null;
      subscribers.forEach((s) => {
        if (selection.has(s.id) && !prev.has(s.id)) {
          if (!next) next = new Map(prev);
          next.set(s.id, s);
        }
      });
      return next ?? prev;
    });
  }, [subscribers, selection]);

  const visibleIds = subscribers.map((s) => s.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selection.has(id));
  const someVisibleSelected = visibleIds.some((id) => selection.has(id));
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = !allVisibleSelected && someVisibleSelected;
  }, [allVisibleSelected, someVisibleSelected]);

  const toggleOne = (sub: Subscriber) => {
    const id = sub.id;
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, sub);
      return next;
    });
  };

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelection((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
      setSelectedMap((prev) => {
        const next = new Map(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      const toAdd = subscribers.filter((s) => !selection.has(s.id));
      setSelection((prev) => new Set([...prev, ...visibleIds]));
      setSelectedMap((prev) => {
        const next = new Map(prev);
        toAdd.forEach((s) => next.set(s.id, s));
        return next;
      });
    }
  };

  const handleConfirm = () => {
    const ids = Array.from(selection);
    const ordered = ids.map((id) => {
      const s = selectedMap.get(id);
      return s ? { id: s.id, email: s.email, status: s.status ?? "active" } : null;
    }).filter(Boolean) as { id: string; email: string; status: string }[];
    onConfirm(ids, ordered);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscriber-selector-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-white/10 bg-hot-black shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="subscriber-selector-title" className="font-serif text-xl font-semibold text-hot-white">
            Select Audience
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 font-sans text-gray-400 transition-colors hover:bg-white/10 hover:text-hot-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 border-b border-white/10 px-6 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscribers..."
            className="w-full rounded-md border border-white/20 bg-black px-4 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-white/10 bg-hot-black">
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    className="rounded border-white/20 bg-black text-hot-white focus:ring-0"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">Subscriber</th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selection.has(sub.id)}
                        onChange={() => toggleOne(sub)}
                        className="rounded border-white/20 bg-black text-hot-white focus:ring-0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-sans text-xs font-medium text-hot-white"
                          aria-hidden
                        >
                          {initials(sub.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-sans font-medium text-hot-white">
                            {sub.email}
                          </p>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                              sub.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {sub.status === "active" ? "Active" : sub.status === "bounced" ? "Bounced" : "Unsubscribed"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {sub.source ? (
                        <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                          {sub.source}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {sub.created_at
                        ? format(new Date(sub.created_at), "MMM d, yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-6 py-4">
          <span className="font-sans text-sm text-gray-400">
            {selection.size} user{selection.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm text-hot-white transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
