import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type { SponsorBlockData } from "@/lib/types/post";
import { DEFAULT_SPONSOR_BLOCK_DATA } from "@/lib/types/post";
import { SponsorBlockNodeView } from "@/components/editor/nodes/SponsorBlockNodeView";

export const SPONSOR_BLOCK_EDIT_EVENT = "edit-sponsor-block";

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

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    sponsorBlock: {
      setSponsorBlock: (data: SponsorBlockData) => ReturnType;
    };
  }
}

export const SponsorBlockExtension = Node.create({
  name: "sponsorBlock",

  priority: 1000,

  group: "block",
  atom: true,

  addAttributes() {
    return {
      data: {
        default: JSON.stringify(DEFAULT_SPONSOR_BLOCK_DATA),
        parseHTML: (element) => element.getAttribute("data-sponsor") ?? JSON.stringify(DEFAULT_SPONSOR_BLOCK_DATA),
        renderHTML: (attrs) => ({ "data-sponsor": attrs.data }),
      },
    };
  },

  addOptions() {
    return { HTMLAttributes: {} };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="sponsor-block"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const dataStr = HTMLAttributes.data ?? node.attrs.data ?? JSON.stringify(DEFAULT_SPONSOR_BLOCK_DATA);
    const data = parseData(dataStr);
    const title = data.title?.trim() || "Untitled";
    const count = data.items?.length ?? 0;

    const wrapperAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      "data-type": "sponsor-block",
      "data-sponsor": dataStr,
    });

    return [
      "div",
      wrapperAttrs,
      [
        "div",
        {
          style:
            "padding:12px 16px; border:1px dashed #6b7280; border-radius:8px; background:rgba(255,255,255,0.05); color:#9ca3af; font-size:14px; cursor:pointer;",
          "data-sponsor-preview": "true",
        },
        `Sponsor Block: ${title} – ${count} logo${count !== 1 ? "s" : ""}`,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SponsorBlockNodeView);
  },

  addCommands() {
    return {
      setSponsorBlock:
        (data: SponsorBlockData) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              data: JSON.stringify({ ...DEFAULT_SPONSOR_BLOCK_DATA, ...data }),
            },
          });
        },
    };
  },
});
