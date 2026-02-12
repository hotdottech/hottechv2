"use client";

import { useState, useCallback } from "react";
import { updateFooterSettings } from "@/lib/actions/settings";
import type {
  FooterConfig,
  FooterBlock,
  FooterBlockType,
  FooterTextBlockData,
  FooterNewsletterBlockData,
  FooterMenuBlockData,
  FooterMenuLink,
  FooterSocialBlockData,
  FooterSocialLink,
} from "@/lib/types";

const BLOCK_LABELS: Record<FooterBlockType, string> = {
  text: "Text",
  newsletter: "Newsletter",
  menu: "Menu",
  social: "Social",
};

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createBlock(type: FooterBlockType): FooterBlock {
  const id = generateId();
  const data: unknown =
    type === "text"
      ? ({ content: "" } as FooterTextBlockData)
      : type === "newsletter"
        ? ({ title: "Stay updated", placeholder: "Your email", buttonText: "Subscribe" } as FooterNewsletterBlockData)
        : type === "menu"
          ? ({ links: [] } as FooterMenuBlockData)
          : ({ links: [] } as FooterSocialBlockData);
  return { id, type, data };
}

type FooterEditorProps = {
  initialConfig: FooterConfig;
};

export function FooterEditor({ initialConfig }: FooterEditorProps) {
  const [config, setConfig] = useState<FooterConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editBlock, setEditBlock] = useState<{ block: FooterBlock; columnIndex: number; blockIndex: number } | null>(null);

  const setColumn = useCallback((columnIndex: number, blocks: FooterBlock[]) => {
    setConfig((prev) => {
      const next = [...prev.columns];
      next[columnIndex] = blocks;
      return { columns: next as [FooterBlock[], FooterBlock[], FooterBlock[]] };
    });
    setSaved(false);
  }, []);

  const addBlock = useCallback(
    (columnIndex: number, type: FooterBlockType) => {
      const block = createBlock(type);
      setConfig((prev) => {
        const next = [...prev.columns];
        const col = [...(next[columnIndex] ?? [])];
        col.push(block);
        next[columnIndex] = col;
        return { columns: next as [FooterBlock[], FooterBlock[], FooterBlock[]] };
      });
      setSaved(false);
      setEditBlock({ block, columnIndex, blockIndex: (config.columns[columnIndex]?.length ?? 0) });
    },
    [config.columns]
  );

  const updateBlock = useCallback(
    (columnIndex: number, blockIndex: number, updated: FooterBlock) => {
      setConfig((prev) => {
        const next = [...prev.columns];
        const col = [...(next[columnIndex] ?? [])];
        col[blockIndex] = updated;
        next[columnIndex] = col;
        return { columns: next as [FooterBlock[], FooterBlock[], FooterBlock[]] };
      });
      setSaved(false);
      setEditBlock((prev) => (prev ? { ...prev, block: updated } : null));
    },
    []
  );

  const removeBlock = useCallback((columnIndex: number, blockIndex: number) => {
    setConfig((prev) => {
      const next = [...prev.columns];
      const col = (next[columnIndex] ?? []).filter((_, i) => i !== blockIndex);
      next[columnIndex] = col;
      return { columns: next as [FooterBlock[], FooterBlock[], FooterBlock[]] };
    });
    setSaved(false);
    setEditBlock(null);
  }, []);

  const openEdit = useCallback(
    (columnIndex: number, blockIndex: number) => {
      const block = config.columns[columnIndex]?.[blockIndex];
      if (block) setEditBlock({ block, columnIndex, blockIndex });
    },
    [config.columns]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    const result = await updateFooterSettings(config);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }, [config]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-sans text-sm text-gray-400">
          Edit blocks in each column. Click a block to edit.
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {([0, 1, 2] as const).map((colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <h3 className="mb-3 font-sans text-xs font-medium uppercase tracking-wider text-gray-500">
              Column {colIndex + 1}
            </h3>
            <div className="flex flex-col gap-2">
              {(config.columns[colIndex] ?? []).map((block, blockIndex) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-hot-gray/30 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => openEdit(colIndex, blockIndex)}
                    className="min-w-0 flex-1 text-left font-sans text-sm text-hot-white hover:underline"
                  >
                    {BLOCK_LABELS[block.type]}
                    {(block.type === "text" && (block.data as FooterTextBlockData)?.content) && (
                      <span className="ml-1 text-gray-400">
                        — {(block.data as FooterTextBlockData).content?.slice(0, 30)}…
                      </span>
                    )}
                    {(block.type === "newsletter" && (block.data as FooterNewsletterBlockData)?.title) && (
                      <span className="ml-1 text-gray-400">
                        — {(block.data as FooterNewsletterBlockData).title}
                      </span>
                    )}
                    {(block.type === "menu" && (block.data as FooterMenuBlockData)?.links?.length) !== undefined && (
                      <span className="ml-1 text-gray-400">
                        — {(block.data as FooterMenuBlockData).links?.length ?? 0} links
                      </span>
                    )}
                    {(block.type === "social" && (block.data as FooterSocialBlockData)?.links?.length) !== undefined && (
                      <span className="ml-1 text-gray-400">
                        — {(block.data as FooterSocialBlockData).links?.length ?? 0} links
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(colIndex, blockIndex)}
                    className="shrink-0 rounded px-2 py-1 font-sans text-xs text-red-400 hover:bg-red-500/10"
                    aria-label="Remove block"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="mb-2 font-sans text-xs text-gray-500">Add block</p>
              <div className="flex flex-wrap gap-2">
                {(["text", "newsletter", "menu", "social"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(colIndex, type)}
                    className="rounded-md border border-white/20 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
                  >
                    + {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editBlock && (
        <BlockEditDialog
          block={editBlock.block}
          onSave={(updated) => {
            updateBlock(editBlock.columnIndex, editBlock.blockIndex, updated);
            setEditBlock(null);
          }}
          onClose={() => setEditBlock(null)}
        />
      )}
    </div>
  );
}

type BlockEditDialogProps = {
  block: FooterBlock;
  onSave: (block: FooterBlock) => void;
  onClose: () => void;
};

function BlockEditDialog({ block, onSave, onClose }: BlockEditDialogProps) {
  const [data, setData] = useState(block.data ?? {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...block, data });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-edit-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/10 bg-hot-gray p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="block-edit-title" className="mb-4 font-serif text-lg font-semibold text-hot-white">
          Edit {BLOCK_LABELS[block.type]}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {block.type === "text" && (
            <div>
              <label className="mb-1 block font-sans text-sm text-gray-400">
                Content
              </label>
              <textarea
                value={(data as FooterTextBlockData).content ?? ""}
                onChange={(e) =>
                  setData({ ...data, content: e.target.value } as FooterTextBlockData)
                }
                rows={4}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
                placeholder="Footer text (plain or HTML)"
              />
            </div>
          )}
          {block.type === "newsletter" && (
            <>
              <div>
                <label className="mb-1 block font-sans text-sm text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  value={(data as FooterNewsletterBlockData).title ?? ""}
                  onChange={(e) =>
                    setData({ ...data, title: e.target.value } as FooterNewsletterBlockData)
                  }
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
                  placeholder="Stay updated"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-sm text-gray-400">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={(data as FooterNewsletterBlockData).placeholder ?? ""}
                  onChange={(e) =>
                    setData({ ...data, placeholder: e.target.value } as FooterNewsletterBlockData)
                  }
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-sm text-gray-400">
                  Button text
                </label>
                <input
                  type="text"
                  value={(data as FooterNewsletterBlockData).buttonText ?? ""}
                  onChange={(e) =>
                    setData({ ...data, buttonText: e.target.value } as FooterNewsletterBlockData)
                  }
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
                  placeholder="Subscribe"
                />
              </div>
            </>
          )}
          {block.type === "menu" && (
            <MenuLinksEditor
              links={(data as FooterMenuBlockData).links ?? []}
              onChange={(links) =>
                setData({ ...data, links } as FooterMenuBlockData)
              }
            />
          )}
          {block.type === "social" && (
            <SocialLinksEditor
              links={(data as FooterSocialBlockData).links ?? []}
              onChange={(links) =>
                setData({ ...data, links } as FooterSocialBlockData)
              }
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-gray hover:bg-hot-white/90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MenuLinksEditor({
  links,
  onChange,
}: {
  links: FooterMenuLink[];
  onChange: (links: FooterMenuLink[]) => void;
}) {
  const add = () => onChange([...links, { label: "", url: "" }]);
  const update = (index: number, field: "label" | "url", value: string) => {
    const next = [...links];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };
  const remove = (index: number) => onChange(links.filter((_, i) => i !== index));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="font-sans text-sm text-gray-400">Links</label>
        <button
          type="button"
          onClick={add}
          className="rounded border border-white/20 px-2 py-1 font-sans text-xs text-hot-white hover:bg-white/10"
        >
          + Add link
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={link.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label"
              className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => update(i, "url", e.target.value)}
              placeholder="URL"
              className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 rounded px-2 py-1 text-red-400 hover:bg-red-500/10"
              aria-label="Remove link"
            >
              ×
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="font-sans text-sm text-gray-500">No links. Click &quot;Add link&quot; to add one.</p>
        )}
      </div>
    </div>
  );
}

const SOCIAL_PLATFORMS = ["twitter", "linkedin", "youtube", "instagram", "github", "website"];

function SocialLinksEditor({
  links,
  onChange,
}: {
  links: FooterSocialLink[];
  onChange: (links: FooterSocialLink[]) => void;
}) {
  const getUrl = (platform: string) =>
    links.find((l) => l.platform === platform)?.url ?? "";
  const setUrl = (platform: string, url: string) => {
    const rest = links.filter((l) => l.platform !== platform);
    if (url.trim()) onChange([...rest, { platform, url: url.trim() }]);
    else onChange(rest);
  };

  return (
    <div>
      <label className="mb-2 block font-sans text-sm text-gray-400">
        Social / external links (URL per platform)
      </label>
      <div className="flex flex-col gap-2">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div key={platform} className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-sans text-sm capitalize text-gray-400">
              {platform}
            </span>
            <input
              type="url"
              value={getUrl(platform)}
              onChange={(e) => setUrl(platform, e.target.value)}
              placeholder={`https://…`}
              className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
