"use server";

import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/lib/supabase";

export type NewsletterRow = {
  id: string;
  subject: string | null;
  slug: string | null;
  preview_text: string | null;
  content: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  published_at: string | null;
};

export async function getStats(): Promise<{ count: number }> {
  const client = await createClient();
  const { count, error } = await client
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (error) {
    console.error("[getStats]", error);
    return { count: 0 };
  }
  return { count: count ?? 0 };
}

export async function getNewsletters(): Promise<NewsletterRow[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("newsletters")
    .select("id, subject, slug, preview_text, content, status, created_at, updated_at, published_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getNewsletters]", error);
    return [];
  }
  return (data ?? []) as NewsletterRow[];
}

export async function getNewsletterById(id: string): Promise<NewsletterRow | null> {
  const client = await createClient();
  const { data, error } = await client
    .from("newsletters")
    .select("id, subject, slug, preview_text, content, status, created_at, updated_at, published_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getNewsletterById]", error);
    return null;
  }
  return data as NewsletterRow | null;
}

export async function createNewsletter(formData: FormData): Promise<{ id?: string; error?: string }> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Unauthorized." };

  const subject = (formData.get("subject") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const preview_text = (formData.get("preview_text") as string)?.trim() ?? "";
  const content = (formData.get("content") as string) ?? "";
  const status = (formData.get("status") as string) || "draft";

  if (!subject) return { error: "Subject is required." };

  const { data, error } = await client
    .from("newsletters")
    .insert({
      subject,
      slug: slug || null,
      preview_text: preview_text || null,
      content: content || null,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createNewsletter]", error);
    return { error: error.message };
  }
  return { id: data?.id };
}

export async function updateNewsletter(id: string, formData: FormData): Promise<{ error?: string }> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Unauthorized." };

  const subject = (formData.get("subject") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const preview_text = (formData.get("preview_text") as string)?.trim();
  const content = formData.get("content") as string;
  const status = (formData.get("status") as string) || "draft";

  const { error } = await client
    .from("newsletters")
    .update({
      ...(subject != null && { subject }),
      ...(slug != null && { slug: slug || null }),
      ...(preview_text != null && { preview_text: preview_text || null }),
      ...(content != null && { content }),
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[updateNewsletter]", error);
    return { error: error.message };
  }
  return {};
}

// Send logic commented out for now – rebuild later with Supabase + HTML email
export async function sendTestEmail(
  _slug: string,
  _email: string
): Promise<{ error?: string }> {
  return { error: "Send test is disabled for now. Save drafts only." };
}

export async function broadcastNewsletter(_slug: string): Promise<{ error?: string; count?: number }> {
  return { error: "Broadcast is disabled for now. Save drafts only." };
}
