"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { updatePost, uploadPostImage, type PostRow } from "./actions";
import { compressImage } from "@/lib/image-compression";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export function EditPostForm({ post }: { post: PostRow }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title ?? "");
  const [slug, setSlug] = useState(post.slug ?? "");
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [body, setBody] = useState(post.body ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (post.status as "draft" | "published") || "draft"
  );
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(post.published_at));
  const [sourceName, setSourceName] = useState(post.source_name ?? "");
  const [originalUrl, setOriginalUrl] = useState(post.original_url ?? "");
  const [metaTitle, setMetaTitle] = useState(post.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post.meta_description ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post.canonical_url ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(
    post.featured_image
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const featuredInputRef = useRef<HTMLInputElement>(null);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  }

  function handleGenerateSlug() {
    setSlug(slugify(title));
  }

  async function handleFeaturedChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.set("file", compressed);
    const result = await uploadPostImage(formData);
    e.target.value = "";
    if (result.url) setFeaturedImageUrl(result.url);
  }

  async function handleSave(asDraft: boolean) {
    setError("");
    setSaving(true);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("excerpt", excerpt);
    formData.set("body", body);
    formData.set("featured_image", featuredImageUrl ?? "");
    formData.set("status", asDraft ? "draft" : "published");
    if (publishedAt) formData.set("published_at", publishedAt);
    formData.set("source_name", sourceName);
    formData.set("original_url", originalUrl);
    formData.set("meta_title", metaTitle);
    formData.set("meta_description", metaDescription);
    formData.set("canonical_url", canonicalUrl);
    const result = await updatePost(post.id, formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/posts");
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="min-w-0 flex-1 space-y-6 lg:max-w-[66.666%]">
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="mt-2 w-full rounded-md border border-white/10 bg-hot-gray px-4 py-3 font-serif text-xl text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          />
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary…"
            rows={3}
            className="mt-2 w-full resize-y rounded-md border border-white/10 bg-hot-gray px-4 py-3 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          />
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-400">
            Body
          </label>
          <TiptapEditor
            content={body}
            onChange={setBody}
            placeholder="Write your story…"
            className="mt-2"
          />
        </div>
      </div>

      <aside className="w-full shrink-0 space-y-4 lg:w-[33.333%]">
        {error && (
          <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-sans text-sm font-medium text-hot-white">
            Publish Date
          </h3>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="mt-3 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-sans text-sm font-medium text-hot-white">
            Publication Info
          </h3>
          <div className="mt-3 space-y-2">
            <div>
              <label className="block font-sans text-xs text-gray-500">Source</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. Forbes, Authory"
                className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500">Original URL</label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://…"
                className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-sans text-sm font-medium text-hot-white">
            Publish
          </h3>
          <div className="mt-3 space-y-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex-1 rounded-md border border-white/20 bg-white/10 py-2 font-sans text-sm font-medium text-hot-white transition-colors hover:bg-white/15 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 rounded-md bg-hot-white py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90 disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-sans text-sm font-medium text-hot-white">
            URL Slug
          </h3>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              className="flex-1 rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="shrink-0 rounded-md border border-white/20 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <button
            type="button"
            onClick={() => setSeoOpen((o) => !o)}
            className="flex w-full items-center justify-between font-sans text-sm font-medium text-hot-white"
          >
            SEO
            <span className="text-gray-400">{seoOpen ? "▼" : "▶"}</span>
          </button>
          {seoOpen && (
            <div className="mt-3 space-y-2">
              <div>
                <label className="block font-sans text-xs text-gray-500">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Title for search results"
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-500">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Short description for search results"
                  rows={2}
                  className="mt-1 w-full resize-y rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-500">Canonical URL</label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://…"
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-sans text-sm font-medium text-hot-white">
            Featured Image
          </h3>
          <input
            ref={featuredInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFeaturedChange}
          />
          {featuredImageUrl ? (
            <div className="mt-3 space-y-2">
              <img
                src={featuredImageUrl}
                alt="Featured"
                className="max-h-40 w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFeaturedImageUrl(null);
                  featuredInputRef.current?.click();
                }}
                className="text-sm text-gray-400 hover:text-hot-white"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => featuredInputRef.current?.click()}
              className="mt-3 flex w-full items-center justify-center rounded-md border border-dashed border-white/20 py-8 font-sans text-sm text-gray-400 transition-colors hover:border-white/30 hover:text-hot-white"
            >
              Upload image
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
