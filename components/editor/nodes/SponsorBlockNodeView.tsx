"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Pencil } from "lucide-react";
import { SponsorBlock } from "@/components/posts/SponsorBlock";
import type { SponsorBlockData } from "@/lib/types/post";
import { DEFAULT_SPONSOR_BLOCK_DATA } from "@/lib/types/post";

/** Must match the extension; used to open edit modal without circular dependency. */
const SPONSOR_BLOCK_EDIT_EVENT = "edit-sponsor-block";

function parseData(raw: string | undefined): SponsorBlockData {
  if (!raw || typeof raw !== "string") return DEFAULT_SPONSOR_BLOCK_DATA;
  try {
    const parsed = JSON.parse(raw) as SponsorBlockData;
    return {
      ...DEFAULT_SPONSOR_BLOCK_DATA,
      ...parsed,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return DEFAULT_SPONSOR_BLOCK_DATA;
  }
}

export function SponsorBlockNodeView({ node, getPos, editor }: NodeViewProps) {
  const data = parseData(node.attrs.data);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = typeof getPos === "function" ? getPos() : undefined;
    if (pos === undefined) return;
    editor.commands.setNodeSelection(pos);
    window.dispatchEvent(
      new CustomEvent(SPONSOR_BLOCK_EDIT_EVENT, {
        detail: { data, position: pos },
      })
    );
  };

  return (
    <NodeViewWrapper className="my-4 block">
      <div className="relative group">
        <SponsorBlock data={data} />
        <button
          type="button"
          onClick={handleEdit}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md border border-white/20 bg-hot-black/90 px-2.5 py-1.5 text-xs text-hot-white opacity-0 shadow-md transition-opacity hover:bg-white/10 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
          aria-label="Edit sponsor block"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
    </NodeViewWrapper>
  );
}
