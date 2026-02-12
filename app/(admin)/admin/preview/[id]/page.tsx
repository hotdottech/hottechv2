"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { ShowcaseGrid } from "@/components/posts/ShowcaseGrid";
import { PostBody } from "@/components/posts/PostBody";
import { SponsorBlock } from "@/components/posts/SponsorBlock";
import type { SponsorBlockData } from "@/lib/types/post";
import { SocialEmbedEnhancer } from "@/components/posts/SocialEmbedEnhancer";

type PostRow = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  main_image: string | null;
  draft_title: string | null;
  draft_summary: string | null;
  draft_content: string | null;
  draft_hero_image: string | null;
  updated_at: string | null;
  created_at: string | null;
  published_at: string | null;
  source_name: string | null;
  showcase_data?: unknown[];
  display_options?: Record<string, unknown>;
  content_type_slug?: string | null;
};

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function AdminPreviewPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [post, setPost] = useState<PostRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabase();
      const { data: postData, error: fetchError } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, content, main_image, status, created_at, updated_at, published_at, source_name, showcase_data, display_options, draft_title, draft_summary, draft_content, draft_hero_image")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) {
        console.error("[AdminPreview] fetch error", fetchError);
        setError(fetchError.message);
        setPost(null);
        setLoading(false);
        return;
      }
      if (!postData) {
        setPost(null);
        setLoading(false);
        return;
      }

      let content_type_slug: string | null = null;
      const { data: pct } = await supabase
        .from("post_content_types")
        .select("content_type_id")
        .eq("post_id", postData.id)
        .maybeSingle();
      if (pct?.content_type_id != null) {
        const { data: ct } = await supabase
          .from("content_types")
          .select("slug")
          .eq("id", pct.content_type_id)
          .maybeSingle();
        content_type_slug = ct?.slug ?? null;
      }

      setPost({
        ...postData,
        content_type_slug,
      } as PostRow);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (!id) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
        Missing post ID
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-amber-200">
        <span className="font-sans text-sm">Loading Preview…</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        {error ? `Error: ${error}` : "Post not found"}
      </div>
    );
  }

  const title = post.draft_title ?? post.title;
  const content = post.draft_content ?? post.content ?? "";
  const featured_image = post.draft_hero_image ?? post.main_image;
  const excerpt = post.draft_summary ?? post.excerpt;

  const date = post.updated_at ?? post.created_at;
  const displayOptions = post.display_options ?? {};
  const hideHeader = displayOptions.hide_header === true;

  return (
    <>
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
                {title ?? "Untitled"}
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

        {featured_image && (
          <div className="relative my-12 aspect-video w-full overflow-hidden rounded-xl bg-hot-gray">
            <Image
              src={featured_image}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        <PostBody
          key={`${post.updated_at ?? ""}-${content.length}`}
          html={content}
          className="prose prose-lg prose-invert mx-auto max-w-2xl max-w-none"
        />
        {(() => {
          const opts = post.display_options;
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
              displayOptions={post.display_options}
            />
          )}
        <SocialEmbedEnhancer />
      </article>
    </>
  );
}
