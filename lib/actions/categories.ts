"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    || "category";
}

export type CategoryRow = {
  id: number;
  name: string | null;
  slug: string | null;
  parent_id: number | null;
  created_at: string | null;
};

export async function getCategories(): Promise<CategoryRow[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("categories")
    .select("id, name, slug, parent_id, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getCategories]", error);
    return [];
  }
  return (data ?? []) as CategoryRow[];
}

export async function createCategory(
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

  const parentIdRaw = formData.get("parent_id");
  const parent_id =
    parentIdRaw != null && String(parentIdRaw).trim() !== ""
      ? parseInt(String(parentIdRaw), 10)
      : null;
  const insertPayload: { name: string; slug: string; parent_id?: number | null } = {
    name,
    slug,
  };
  if (parent_id != null && !Number.isNaN(parent_id)) insertPayload.parent_id = parent_id;

  const { error } = await client
    .from("categories")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("[createCategory]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return {};
}

export async function updateCategory(
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
    return { error: "Invalid category." };
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugInput ? slugFromName(slugInput) : slugFromName(name);

  const parentIdRaw = formData.get("parent_id");
  let parent_id: number | null =
    parentIdRaw != null && String(parentIdRaw).trim() !== ""
      ? parseInt(String(parentIdRaw), 10)
      : null;
  if (parent_id === id) parent_id = null; // prevent self-reference loop

  const { error } = await client
    .from("categories")
    .update({ name, slug, parent_id })
    .eq("id", id);

  if (error) {
    console.error("[updateCategory]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return {};
}

export async function deleteCategory(id: number): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await client.from("categories").delete().eq("id", id);

  if (error) {
    console.error("[deleteCategory]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return {};
}
