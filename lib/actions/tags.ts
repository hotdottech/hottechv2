"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    || "tag";
}

export type TagRow = {
  id: number;
  name: string | null;
  slug: string | null;
  created_at: string | null;
};

export async function getTags(): Promise<TagRow[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("tags")
    .select("id, name, slug, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getTags]", error);
    return [];
  }
  return (data ?? []) as TagRow[];
}

export async function createTag(
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
    .from("tags")
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    console.error("[createTag]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/tags");
  return {};
}

export async function updateTag(
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
    return { error: "Invalid tag." };
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugInput ? slugFromName(slugInput) : slugFromName(name);

  const { error } = await client.from("tags").update({ name, slug }).eq("id", id);

  if (error) {
    console.error("[updateTag]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/tags");
  return {};
}

export async function deleteTag(id: number): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await client.from("tags").delete().eq("id", id);

  if (error) {
    console.error("[deleteTag]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/tags");
  return {};
}
