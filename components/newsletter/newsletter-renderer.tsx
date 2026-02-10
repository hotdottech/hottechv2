"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CustomPortableText } from "@/components/feed/portable-text";
import { urlFor } from "@/lib/sanity";
import type { NewsletterBodyBlock } from "@/lib/data";

type Props = { body: NewsletterBodyBlock[] | null };

export function NewsletterRenderer({ body }: Props) {
  if (!body || body.length === 0) return null;

  return (
    <div className="space-y-8">
      {body.map((block) => {
        if (!block._key) return null;

        if (block._type === "block") {
          return (
            <div key={block._key} className="newsletter-block">
              <CustomPortableText value={[block]} />
            </div>
          );
        }

        if (block._type === "reference" && "post" in block && block.post) {
          const post = block.post;
          const slug = post.slug ?? "";
          const imageUrl = post.mainImage
            ? urlFor(post.mainImage as Parameters<typeof urlFor>[0]).width(400).height(225).url()
            : null;
          return (
            <Link
              key={block._key}
              href={`/${slug}`}
              className="flex gap-4 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20"
            >
              {imageUrl && (
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded bg-hot-gray">
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-semibold text-hot-white">
                  {post.title ?? "Untitled"}
                </h3>
                {post.excerpt && (
                  <p className="mt-1 font-sans text-sm text-gray-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          );
        }

        if (block._type === "externalLink") {
          const url = block.url ?? "#";
          const imageUrl = block.image
            ? urlFor(block.image as Parameters<typeof urlFor>[0]).width(400).height(225).url()
            : null;
          const isExternal = url.startsWith("http");
          const content = (
            <>
              {imageUrl && (
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded bg-hot-gray">
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-semibold text-hot-white flex items-center gap-1">
                  {block.title ?? "Link"}
                  {isExternal && <ExternalLink className="h-4 w-4 shrink-0" />}
                </h3>
                {block.description && (
                  <p className="mt-1 font-sans text-sm text-gray-400 line-clamp-2">
                    {block.description}
                  </p>
                )}
              </div>
            </>
          );
          if (isExternal) {
            return (
              <a
                key={block._key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20"
              >
                {content}
              </a>
            );
          }
          return (
            <Link
              key={block._key}
              href={url}
              className="flex gap-4 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20"
            >
              {content}
            </Link>
          );
        }

        if (block._type === "sectionHeader") {
          const title = block.title ?? "";
          return (
            <div key={block._key} className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-hot-white">
                {title}
              </h2>
              <div className="h-px bg-white/10" aria-hidden />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
