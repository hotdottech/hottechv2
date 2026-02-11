"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";
import { updatePost, createPost, type PostRow } from "./actions";
import { createTag } from "@/lib/actions/tags";
import type { CategoryRow } from "@/lib/actions/categories";
import type { TagRow } from "@/lib/actions/tags";
import type { ContentTypeRow } from "@/lib/actions/content-types";
import { SidebarSection } from "@/app/components/admin/posts/SidebarSection";
import { ShowcaseManager, type ShowcaseItem } from "@/app/components/admin/posts/ShowcaseManager";
import { TagInput, type SelectedTag } from "@/app/components/admin/posts/TagInput";
import { UniversalImagePicker } from "@/app/components/admin/shared/UniversalImagePicker";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function buildCategoryRows(categories: CategoryRow[]): { category: CategoryRow; depth: number }[] {
  const byParent = new Map<number | null, CategoryRow[]>();
  for (const c of categories) {
    const key = c.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  const result: { category: CategoryRow; depth: number }[] = [];
  function visit(parentId: number | null, depth: number) {
    const list = byParent.get(parentId) ?? [];
    list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    for (const c of list) {
      result.push({ category: c, depth });
      visit(c.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
}

type EditPostFormProps = {
  post: PostRow | null;
  categories: CategoryRow[];
  tags: TagRow[];
  contentTypes: ContentTypeRow[];
  initialCategoryIds: number[];
  initialTagIds: number[];
  initialContentTypeId: number | null;
};

export function EditPostForm({
  post,
  categories,
  tags,
  contentTypes,
  initialCategoryIds,
  initialTagIds,
  initialContentTypeId,
}: EditPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (post?.status as "draft" | "published") || "draft"
  );
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(post?.published_at ?? null));
  const [sourceName, setSourceName] = useState(post?.source_name ?? "");
  const [originalUrl, setOriginalUrl] = useState(post?.original_url ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(
    post?.featured_image ?? null
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(
    () => new Set(initialCategoryIds)
  );
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>(() =>
    initialTagIds.map((id) => {
      const t = tags.find((x) => x.id === id);
      return { id: t?.id ?? id, name: t?.name ?? String(id) };
    })
  );
  const [selectedContentTypeId, setSelectedContentTypeId] = useState<number | null>(
    initialContentTypeId
  );
  const [displayOptions, setDisplayOptions] = useState<Record<string, unknown>>(() => {
    const opts = post?.display_options;
    if (opts != null && typeof opts === "object" && !Array.isArray(opts)) {
      return { ...(opts as Record<string, unknown>) };
    }
    return {};
  });
  const [showcaseData, setShowcaseData] = useState<ShowcaseItem[]>(() => {
    const raw = post?.showcase_data;
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (x): x is ShowcaseItem =>
        x != null &&
        typeof x === "object" &&
        typeof (x as ShowcaseItem).id === "string" &&
        typeof (x as ShowcaseItem).title === "string"
    ) as ShowcaseItem[];
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryRows = useMemo(() => buildCategoryRows(categories), [categories]);
  const selectedContentTypeSlug =
    contentTypes.find((ct) => ct.id === selectedContentTypeId)?.slug ?? null;
  const isShowcase = selectedContentTypeSlug?.startsWith("showcase_") ?? false;
  const showcaseType: "people" | "products" =
    selectedContentTypeSlug === "showcase_people" ? "people" : "products";
  const availableTagOptions = useMemo(
    () => tags.map((t) => ({ id: t.id, name: t.name ?? "", slug: t.slug ?? "" })),
    [tags]
  );

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .trim();
  }

  const lastAutoSlugRef = useRef(slugify(post?.title ?? ""));
  const [isSlugDirty, setSlugDirty] = useState(() => {
    if (!post?.slug) return false;
    return post.slug !== slugify(post.title ?? "");
  });

  useEffect(() => {
    if (isSlugDirty) return;
    const newAuto = slugify(title);
    if (!title || (slug !== "" && slug !== lastAutoSlugRef.current)) return;
    setSlug(newAuto);
    lastAutoSlugRef.current = newAuto;
  }, [title, isSlugDirty, slug]);

  function handleTitleChange(value: string) {
    setTitle(value);
  }

  function handleTitleBlur() {
    if (isSlugDirty) return;
    const newAuto = slugify(title);
    if (slug === "" || slug === lastAutoSlugRef.current) {
      setSlug(newAuto);
      lastAutoSlugRef.current = newAuto;
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugDirty(true);
  }

  function handleGenerateSlug() {
    setSlug(slugify(title));
    lastAutoSlugRef.current = slugify(title);
    setSlugDirty(false);
  }

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave(asDraft: boolean) {
    setError("");
    setSaving(true);
    const newTags = selectedTags.filter((t) => t.isNew);
    const existingTagIds = selectedTags.filter((t) => !t.isNew).map((t) => t.id);
    const createdIds: number[] = [];
    for (const t of newTags) {
      const fd = new FormData();
      fd.set("name", t.name);
      const res = await createTag(fd);
      if (res.error) {
        setError(res.error);
        setSaving(false);
        return;
      }
      if (res.id != null) createdIds.push(res.id);
    }
    const finalTagIds = [...existingTagIds, ...createdIds];

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
    selectedCategoryIds.forEach((id) => formData.append("category_ids", String(id)));
    finalTagIds.forEach((id) => formData.append("tag_ids", String(id)));
    if (selectedContentTypeId != null) formData.set("content_type_id", String(selectedContentTypeId));
    formData.set("showcase_data", JSON.stringify(showcaseData));
    formData.set("display_options", JSON.stringify(displayOptions));

    if (post?.id) {
      const result = await updatePost(post.id, formData);
      setSaving(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/posts");
    } else {
      const result = await createPost(formData);
      setSaving(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.id) router.push(`/admin/posts/${result.id}`);
    }
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
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={handleTitleBlur}
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
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Write your story…"
            className="mt-2"
          />
        </div>
        {isShowcase && (
          <ShowcaseManager
            items={showcaseData}
            onChange={setShowcaseData}
            type={showcaseType}
            displayOptions={displayOptions}
            onDisplayOptionsChange={setDisplayOptions}
          />
        )}
      </div>

      <aside className="sticky top-20 h-[calc(100vh-100px)] w-full shrink-0 overflow-y-auto space-y-4 lg:w-[33.333%]">
        {error && (
          <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <SidebarSection title="Publish Date" defaultOpen={true}>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
          />
        </SidebarSection>

        <SidebarSection title="Publication Info" defaultOpen={true}>
          <div className="space-y-2">
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
        </SidebarSection>

        <SidebarSection title="Display Settings" defaultOpen={false}>
          <label className="flex cursor-pointer items-center gap-2 font-sans text-sm">
            <input
              type="checkbox"
              checked={displayOptions.hide_header === true}
              onChange={(e) => setDisplayOptions((prev) => ({ ...prev, hide_header: e.target.checked }))}
              className="rounded border-white/20 bg-hot-black text-hot-white focus:ring-0"
            />
            <span className="text-hot-white">Hide Header</span>
          </label>
          <p className="mt-1.5 font-sans text-xs text-gray-500">
            Hides title, date, and breadcrumbs for a landing page look.
          </p>
        </SidebarSection>

        <SidebarSection title="Content Type" defaultOpen={true}>
          <select
            value={selectedContentTypeId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedContentTypeId(v === "" ? null : parseInt(v, 10));
            }}
            className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white focus:border-hot-white/30 focus:outline-none"
          >
            <option value="">None</option>
            {contentTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
              </option>
            ))}
          </select>
        </SidebarSection>

        <SidebarSection title="Categories" defaultOpen={true}>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {categoryRows.length === 0 ? (
              <p className="text-xs text-gray-500">No categories defined.</p>
            ) : (
              categoryRows.map(({ category: c, depth }) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 py-0.5 font-sans text-sm"
                  style={{ paddingLeft: `${depth * 12}px` }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.has(c.id)}
                    onChange={() => toggleCategory(c.id)}
                    className="rounded border-white/20 bg-hot-black text-hot-white focus:ring-0"
                  />
                  {depth > 0 && <span className="text-gray-500">↳</span>}
                  <span className="text-hot-white">{c.name}</span>
                </label>
              ))
            )}
          </div>
        </SidebarSection>

        <SidebarSection title="Tags" defaultOpen={true}>
          <TagInput
            availableTags={availableTagOptions}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
          />
        </SidebarSection>

        <SidebarSection title="Publish" defaultOpen={true}>
          <div className="space-y-2">
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
        </SidebarSection>

        <SidebarSection title="URL Slug" defaultOpen={false}>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
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
        </SidebarSection>

        <SidebarSection title="SEO" defaultOpen={false}>
          <div className="space-y-2">
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
        </SidebarSection>

        <SidebarSection title="Featured Image" defaultOpen={false}>
          <UniversalImagePicker
            value={featuredImageUrl}
            onChange={(url) => setFeaturedImageUrl(url || null)}
          />
        </SidebarSection>
      </aside>
    </div>
  );
}
