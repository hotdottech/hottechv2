"use client";

import { parsePostBody } from "@/lib/parse-post-body";
import { BlockRenderer } from "@/components/posts/BlockRenderer";

type PostBodyProps = {
  html: string;
  className?: string;
};

export function PostBody({ html, className }: PostBodyProps) {
  const blocks = parsePostBody(html || "");

  if (blocks.length === 0) return null;
  if (blocks.length === 1 && blocks[0].type === "html") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: blocks[0].content }}
      />
    );
  }

  return (
    <BlockRenderer
      blocks={blocks}
      className={className}
      blockClassName="contents"
    />
  );
}
