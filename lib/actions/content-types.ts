"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    || "content-type";
}

export type ContentTypeRow = {
  id: number;
  name: string | null;
  slug: string | null;
  created_at: string | null;
};

export async function getContentTypes(): Promise<ContentTypeRow[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("content_types")
    .select("id, name, slug, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getContentTypes]", error);
    return [];
  }
  return (data ?? []) as ContentTypeRow[];
}

export async function createContentType(
  formData: FormData
): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugInput ? slugFromName(slugInput) : slugFromName(name);

  const { error } = await client
    .from("content_types")
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    console.error("[createContentType]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/content-types");
  return {};
}

export async function updateContentType(
  formData: FormData
): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const idRaw = formData.get("id");
  const id = idRaw != null ? parseInt(String(idRaw), 10) : NaN;
  if (Number.isNaN(id)) {
    return { error: "Invalid content type." };
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugInput ? slugFromName(slugInput) : slugFromName(name);

  const { error } = await client
    .from("content_types")
    .update({ name, slug })
    .eq("id", id);

  if (error) {
    console.error("[updateContentType]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/content-types");
  return {};
}

export async function deleteContentType(id: number): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await client
    .from("content_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteContentType]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/content-types");
  return {};
}
