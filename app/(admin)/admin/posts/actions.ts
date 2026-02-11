"use server";

import { createClient } from "@/utils/supabase/server";

const BUCKET = "post-images";

export async function uploadPostImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !file.size) {
    return { error: "No file provided." };
  }

  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseServer.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) {
    console.error("[uploadPostImage]", uploadError);
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabaseServer.storage.from(BUCKET).getPublicUrl(path);
  return { url: publicUrl };
}

export type PostRow = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  body: string | null;
  featured_image: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  published_at: string | null;
  source_name: string | null;
  original_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
};

export async function getPosts(): Promise<PostRow[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("posts")
    .select("id, title, slug, excerpt, content, main_image, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPosts]", error);
    return [];
  }
  return (data ?? []).map((row: Record<string, unknown>) => {
    const { content, main_image, ...rest } = row;
    return {
      ...rest,
      body: content != null ? String(content) : null,
      featured_image: main_image != null ? String(main_image) : null,
    } as PostRow;
  });
}

export async function getPostById(id: string): Promise<PostRow | null> {
  const client = await createClient();
  const { data, error } = await client
    .from("posts")
    .select("id, title, slug, excerpt, content, main_image, status, created_at, updated_at, published_at, source_name, original_url, meta_title, meta_description, canonical_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getPostById]", error);
    return null;
  }
  if (!data) return null;
  return {
    ...data,
    body: data.content != null ? String(data.content) : null,
    featured_image: data.main_image != null ? String(data.main_image) : null,
  } as PostRow;
}

export type PostTaxonomies = {
  categoryIds: number[];
  tagIds: number[];
  contentTypeId: number | null;
};

export async function getPostTaxonomies(postId: string): Promise<PostTaxonomies> {
  const client = await createClient();
  const [pc, pt, pct] = await Promise.all([
    client.from("post_categories").select("category_id").eq("post_id", postId),
    client.from("post_tags").select("tag_id").eq("post_id", postId),
    client.from("post_content_types").select("content_type_id").eq("post_id", postId).maybeSingle(),
  ]);
  const categoryIds = (pc.data ?? []).map((r: { category_id: number }) => r.category_id);
  const tagIds = (pt.data ?? []).map((r: { tag_id: number }) => r.tag_id);
  const contentTypeId =
    pct.data != null && typeof (pct.data as { content_type_id: number }).content_type_id === "number"
      ? (pct.data as { content_type_id: number }).content_type_id
      : null;
  return { categoryIds, tagIds, contentTypeId };
}

export async function createPost(formData: FormData): Promise<{ id?: string; error?: string }> {
  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string)?.trim() ?? "";
  const body = (formData.get("body") as string) ?? "";
  const featured_image = (formData.get("featured_image") as string) || null;
  const status = (formData.get("status") as string) || "draft";
  const published_at = (formData.get("published_at") as string) || null;
  const source_name = (formData.get("source_name") as string)?.trim() || null;
  const original_url = (formData.get("original_url") as string)?.trim() || null;
  const meta_title = (formData.get("meta_title") as string)?.trim() || null;
  const meta_description = (formData.get("meta_description") as string)?.trim() || null;
  const canonical_url = (formData.get("canonical_url") as string)?.trim() || null;
  const categoryIds = (formData.getAll("category_ids") as string[]).map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
  const tagIds = (formData.getAll("tag_ids") as string[]).map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
  const contentTypeIdRaw = formData.get("content_type_id");
  const contentTypeId =
    contentTypeIdRaw != null && String(contentTypeIdRaw).trim() !== ""
      ? parseInt(String(contentTypeIdRaw), 10)
      : null;
  const contentTypeIdValid = contentTypeId != null && !Number.isNaN(contentTypeId) ? contentTypeId : null;

  if (!title) {
    return { error: "Title is required." };
  }

  const now = new Date().toISOString();
  const publishedAt = published_at ? new Date(published_at).toISOString() : now;

  const client = await createClient();
  const { data, error } = await client
    .from("posts")
    .insert({
      title,
      slug: slug || null,
      excerpt: excerpt || null,
      content: body || null,
      main_image: featured_image,
      status,
      published_at: publishedAt,
      created_at: now,
      updated_at: now,
      source_name,
      original_url,
      meta_title,
      meta_description,
      canonical_url,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createPost]", error);
    return { error: error.message };
  }

  const postId = (data as { id: string } | null)?.id;
  if (postId) {
    if (categoryIds.length > 0) {
      await client.from("post_categories").insert(categoryIds.map((category_id) => ({ post_id: postId, category_id })));
    }
    if (tagIds.length > 0) {
      await client.from("post_tags").insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
    }
    if (contentTypeIdValid != null) {
      await client.from("post_content_types").insert({ post_id: postId, content_type_id: contentTypeIdValid });
    }
  }

  return { id: postId };
}

export async function updatePost(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim();
  const body = formData.get("body") as string;
  const featured_image = (formData.get("featured_image") as string) || null;
  const status = (formData.get("status") as string) || "draft";
  const published_at = (formData.get("published_at") as string) || null;
  const source_name = (formData.get("source_name") as string)?.trim() || null;
  const original_url = (formData.get("original_url") as string)?.trim() || null;
  const meta_title = (formData.get("meta_title") as string)?.trim() || null;
  const meta_description = (formData.get("meta_description") as string)?.trim() || null;
  const canonical_url = (formData.get("canonical_url") as string)?.trim() || null;
  const categoryIds = (formData.getAll("category_ids") as string[]).map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
  const tagIds = (formData.getAll("tag_ids") as string[]).map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
  const contentTypeIdRaw = formData.get("content_type_id");
  const contentTypeId =
    contentTypeIdRaw != null && String(contentTypeIdRaw).trim() !== ""
      ? parseInt(String(contentTypeIdRaw), 10)
      : null;
  const contentTypeIdValid = contentTypeId != null && !Number.isNaN(contentTypeId) ? contentTypeId : null;

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    status,
    main_image: featured_image,
    content: body ?? null,
    excerpt: excerpt ?? null,
    slug: slug ?? null,
    title: title ?? undefined,
    ...(published_at && { published_at: new Date(published_at).toISOString() }),
    source_name,
    original_url,
    meta_title,
    meta_description,
    canonical_url,
  };

  const client = await createClient();
  const { error } = await client.from("posts").update(payload).eq("id", id);

  if (error) {
    console.error("[updatePost]", error);
    return { error: error.message };
  }

  // Taxonomies: delete then insert
  await client.from("post_categories").delete().eq("post_id", id);
  await client.from("post_tags").delete().eq("post_id", id);
  await client.from("post_content_types").delete().eq("post_id", id);
  if (categoryIds.length > 0) {
    await client.from("post_categories").insert(categoryIds.map((category_id) => ({ post_id: id, category_id })));
  }
  if (tagIds.length > 0) {
    await client.from("post_tags").insert(tagIds.map((tag_id) => ({ post_id: id, tag_id })));
  }
  if (contentTypeIdValid != null) {
    await client.from("post_content_types").insert({ post_id: id, content_type_id: contentTypeIdValid });
  }
  return {};
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const client = await createClient();
  const { error } = await client.from("posts").delete().eq("id", id);

  if (error) {
    console.error("[deletePost]", error);
    return { error: error.message };
  }
  return {};
}
