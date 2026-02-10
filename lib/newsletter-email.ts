import type { NewsletterBodyBlock } from "@/lib/data";
import { urlFor } from "@/lib/sanity";
import type { EmailBodyBlock } from "@/emails/WeeklyNewsletter";

function blockChildrenToText(children: unknown[] | undefined): string {
  if (!Array.isArray(children)) return "";
  return children
    .map((c) =>
      typeof c === "object" && c !== null && "text" in c && typeof (c as { text: string }).text === "string"
        ? (c as { text: string }).text
        : ""
    )
    .join("");
}

export function serializeBodyForEmail(body: NewsletterBodyBlock[] | null): EmailBodyBlock[] {
  if (!body || !Array.isArray(body)) return [];

  return body.map((block) => {
    if (block._type === "block") {
      const text = blockChildrenToText(block.children);
      return { type: "block" as const, paragraphs: text ? [text] : [] };
    }
    if (block._type === "sectionHeader") {
      return { type: "sectionHeader" as const, title: block.title ?? "" };
    }
    if (block._type === "reference" && "post" in block && block.post) {
      const post = block.post;
      const imageUrl = post.mainImage
        ? urlFor(post.mainImage as Parameters<typeof urlFor>[0]).width(400).height(225).url()
        : null;
      return {
        type: "reference" as const,
        title: post.title ?? "Untitled",
        slug: post.slug ?? "",
        excerpt: post.excerpt ?? null,
        imageUrl,
      };
    }
    if (block._type === "externalLink") {
      const imageUrl = block.image
        ? urlFor(block.image as Parameters<typeof urlFor>[0]).width(400).height(225).url()
        : null;
      return {
        type: "externalLink" as const,
        title: block.title ?? "Link",
        url: block.url ?? "#",
        description: block.description ?? null,
        imageUrl,
      };
    }
    return { type: "block" as const, paragraphs: [] };
  });
}
