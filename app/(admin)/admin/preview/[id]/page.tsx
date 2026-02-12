import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getPostByIdForPreviewWithClient } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShowcaseGrid } from "@/components/posts/ShowcaseGrid";
import { PostBody } from "@/components/posts/PostBody";
import { SponsorBlock } from "@/components/posts/SponsorBlock";
import type { SponsorBlockData } from "@/lib/types/post";
import { SocialEmbedEnhancer } from "@/components/posts/SocialEmbedEnhancer";
import { createClient } from "@/utils/supabase/server";
import { getBaseUrl } from "@/lib/url";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Preview — Draft",
  robots: "noindex, nofollow",
};

export default async function AdminPreviewPage({ params }: PageProps) {
  const { id } = await params;
  console.log("[AdminPreview] Previewing ID:", id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[AdminPreview] No user found.");
    notFound();
  }

  const post = await getPostByIdForPreviewWithClient(supabase, id);
  console.log("[AdminPreview] Post Found:", post ? "Yes" : "No");
  if (!post) {
    console.log("[AdminPreview] notFound: post not found or fetch failed for id:", id);
    notFound();
  }

  const date = post.updated_at ?? post.created_at;
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const articleUrl = post.slug ? `${baseUrl}/${post.slug}` : baseUrl;
  const imageUrl = post.featured_image
    ? post.featured_image.startsWith("http")
      ? post.featured_image
      : `${baseUrl}/${post.featured_image.replace(/^\//, "")}`
    : undefined;

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title ?? "Untitled",
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: (post.published_at ?? post.created_at) ?? undefined,
    dateModified: post.updated_at ?? undefined,
    author: {
      "@type": "Person",
      name: post.source_name ?? "Nirave Gondhia",
    },
    url: articleUrl,
  };

  const displayOptions = (post as { display_options?: Record<string, unknown> }).display_options ?? {};
  const hideHeader = displayOptions.hide_header === true;

  return (
    <>
      <JsonLd data={newsArticleSchema} />
      <Link
        href={`/admin/posts/${post.id}`}
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-hot-black/90 px-3 py-2 font-sans text-sm text-hot-white backdrop-blur hover:bg-hot-gray"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Editor
      </Link>
      <div
        className="sticky top-0 left-0 right-0 z-40 border-b border-amber-500/50 bg-amber-500/20 px-4 py-2 text-center font-sans text-sm font-semibold text-amber-200"
        role="status"
        aria-live="polite"
      >
        PREVIEW MODE — DRAFT CONTENT
      </div>
      <article className="mx-auto max-w-4xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
        {!hideHeader && (
          <>
            <div className="mb-8" />
            <header className="mb-6">
              <h1 className="font-serif text-5xl font-bold text-hot-white mb-6 md:text-6xl">
                {post.title ?? "Untitled"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-gray-400">
                <span className="font-sans text-sm text-hot-white/90">Hot Tech</span>
                {date && (
                  <span className="font-sans text-sm">
                    {format(new Date(date), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </header>
          </>
        )}

        {post.featured_image && (
          <div className="relative my-12 aspect-video w-full overflow-hidden rounded-xl bg-hot-gray">
            <Image
              src={post.featured_image}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        <PostBody
          html={(post as { content?: string; body?: string }).content || post.body || ""}
          className="prose prose-lg prose-invert mx-auto max-w-2xl max-w-none"
        />
        {(() => {
          const opts = (post as { display_options?: Record<string, unknown> }).display_options;
          const sponsorBlock = opts?.sponsor_block as SponsorBlockData | undefined;
          return (
            sponsorBlock &&
            Array.isArray(sponsorBlock.items) &&
            sponsorBlock.items.length > 0 && (
              <SponsorBlock data={sponsorBlock} />
            )
          );
        })()}
        {post.content_type_slug?.startsWith("showcase_") &&
          Array.isArray(post.showcase_data) &&
          post.showcase_data.length > 0 && (
            <ShowcaseGrid
              type={post.content_type_slug === "showcase_people" ? "people" : "products"}
              items={post.showcase_data as any}
              displayOptions={(post as { display_options?: Record<string, unknown> }).display_options}
            />
          )}
        <SocialEmbedEnhancer />
      </article>
    </>
  );
}
