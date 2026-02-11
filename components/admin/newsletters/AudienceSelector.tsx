"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAudienceMetadata,
  calculateRecipientCount,
  type TargetConfig,
  type AudienceMetadata,
} from "@/lib/actions/newsletter-audience";
import { SubscriberSelectorModal } from "./SubscriberSelectorModal";

type ManualDisplay = { email: string; status: string };

type Props = {
  value: TargetConfig;
  onChange: (config: TargetConfig) => void;
};

export function AudienceSelector({ value, onChange }: Props) {
  const [metadata, setMetadata] = useState<AudienceMetadata | null>(null);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [manualDisplay, setManualDisplay] = useState<Record<string, ManualDisplay>>({});

  const type = value.type ?? "all";
  const filters = value.filters ?? { sources: [], tags: [] };
  const manualIds = value.manual_ids ?? [];

  useEffect(() => {
    getAudienceMetadata().then(setMetadata);
  }, []);

  const refreshCount = useCallback(() => {
    calculateRecipientCount(value).then(setEstimatedCount);
  }, [value]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const setType = (t: TargetConfig["type"]) => {
    onChange({
      ...value,
      type: t,
      filters: t === "filter" ? (value.filters ?? { sources: [], tags: [] }) : undefined,
      manual_ids: t === "manual" ? (value.manual_ids ?? []) : undefined,
    });
  };

  const toggleSource = (source: string) => {
    const next = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source];
    onChange({ ...value, type: "filter", filters: { ...filters, sources: next } });
  };

  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...value, type: "filter", filters: { ...filters, tags: next } });
  };

  const handleConfirmSelection = (
    selectedIds: string[],
    selectedSubscribers: { id: string; email: string; status: string }[]
  ) => {
    onChange({ ...value, type: "manual", manual_ids: selectedIds });
    const display: Record<string, ManualDisplay> = {};
    selectedSubscribers.forEach((s) => {
      display[s.id] = { email: s.email, status: s.status };
    });
    setManualDisplay(display);
  };

  const removeManual = (id: string) => {
    onChange({ ...value, type: "manual", manual_ids: manualIds.filter((i) => i !== id) });
    setManualDisplay((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const totalActive = metadata?.totalActive ?? 0;

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="font-sans text-sm font-medium text-gray-400">Audience</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "filter", "manual"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-md border px-3 py-2 font-sans text-sm transition-colors ${
              type === t
                ? "border-hot-white bg-white/10 text-hot-white"
                : "border-white/20 text-gray-400 hover:border-white/30 hover:text-hot-white"
            }`}
          >
            {t === "all" && "All Subscribers"}
            {t === "filter" && "Smart Segment"}
            {t === "manual" && "Manual Selection"}
          </button>
        ))}
      </div>

      {/* Panel: All */}
      {type === "all" && (
        <p className="font-sans text-sm text-gray-400">
          Sends to all {totalActive} active subscribers.
        </p>
      )}

      {/* Panel: Smart Segment */}
      {type === "filter" && (
        <div className="space-y-4">
          {metadata && metadata.sources.length > 0 && (
            <div>
              <p className="mb-2 font-sans text-xs font-medium text-gray-500">Sources (match any)</p>
              <div className="flex flex-wrap gap-2">
                {metadata.sources.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(s)}
                      onChange={() => toggleSource(s)}
                      className="rounded border-white/20 bg-black text-hot-white focus:ring-0"
                    />
                    <span className="font-sans text-sm text-hot-white">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {metadata && metadata.tags.length > 0 && (
            <div>
              <p className="mb-2 font-sans text-xs font-medium text-gray-500">Tags (match any)</p>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((t) => (
                  <label key={t} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(t)}
                      onChange={() => toggleTag(t)}
                      className="rounded border-white/20 bg-black text-hot-white focus:ring-0"
                    />
                    <span className="font-sans text-sm text-hot-white">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {metadata && metadata.sources.length === 0 && metadata.tags.length === 0 && (
            <p className="font-sans text-sm text-gray-500">No sources or tags in your list yet.</p>
          )}
        </div>
      )}

      {/* Panel: Manual */}
      {type === "manual" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectorOpen(true)}
            className="w-full rounded-md border-2 border-dashed border-white/30 py-4 font-sans text-sm font-medium text-hot-white transition-colors hover:border-hot-white/50 hover:bg-white/5"
          >
            + Add Subscribers
          </button>
          {manualIds.length > 0 ? (
            <div className="rounded-md border border-white/10 overflow-hidden">
              <table className="w-full border-collapse font-sans text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Status</th>
                    <th className="w-16 px-4 py-2 text-right font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {manualIds.map((id) => (
                    <tr key={id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-2 font-medium text-hot-white">
                        {manualDisplay[id]?.email ?? id}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            manualDisplay[id]?.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {manualDisplay[id]?.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeManual(id)}
                          className="text-gray-400 hover:text-red-400"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sans text-sm text-gray-500">
              No subscribers selected. Click &quot;+ Add Subscribers&quot; to choose who receives this campaign.
            </p>
          )}
          <SubscriberSelectorModal
            isOpen={selectorOpen}
            onClose={() => setSelectorOpen(false)}
            onConfirm={handleConfirmSelection}
            initialSelection={manualIds}
          />
        </div>
      )}

      {/* Footer: Estimated count */}
      <div className="border-t border-white/10 pt-3">
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-sans text-sm text-hot-white">
          Estimated Recipients: {estimatedCount ?? "…"}
        </span>
      </div>
    </div>
  );
}
