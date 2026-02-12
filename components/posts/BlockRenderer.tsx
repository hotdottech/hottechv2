"use client";

import type { SponsorBlockData } from "@/lib/types/post";
import { SponsorBlock } from "@/components/posts/SponsorBlock";

export type RenderedBlock =
  | { type: "html"; content: string }
  | { type: "sponsor"; data: SponsorBlockData };

type BlockRendererProps = {
  blocks: RenderedBlock[];
  className?: string;
  /** Applied to HTML segment wrappers (e.g. "contents" for prose flow) */
  blockClassName?: string;
};

export function BlockRenderer({
  blocks,
  className,
  blockClassName,
}: BlockRendererProps) {
  if (!blocks?.length) return null;

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "sponsor":
            return <SponsorBlock key={i} data={block.data} />;
          case "html":
          default:
            return block.content ? (
              <div
                key={i}
                dangerouslySetInnerHTML={{ __html: block.content }}
                className={blockClassName ?? "contents"}
              />
            ) : null;
        }
      })}
    </div>
  );
}
