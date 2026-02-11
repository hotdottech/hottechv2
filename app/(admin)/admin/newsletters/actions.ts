"use server";

import { createClient } from "@/utils/supabase/server";
import { getBaseUrl } from "@/lib/url";
import { Resend } from "resend";
import { WeeklyNewsletter } from "@/emails/WeeklyNewsletter";

export type NewsletterRow = {
  id: string;
  subject: string | null;
  slug: string | null;
  preview_text: string | null;
  content: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  sent_at: string | null;
  /** Display date: sent_at when status is 'sent', otherwise created_at. */
  date: string | null;
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
    .select("id, subject, slug, preview_text, content, status, created_at, updated_at, sent_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getNewsletters]", error);
    return [];
  }
  const rows = (data ?? []) as Omit<NewsletterRow, "date">[];
  return rows.map((row) => ({
    ...row,
    date: row.status === "sent" && row.sent_at ? row.sent_at : row.created_at,
  }));
}

export async function getNewsletterById(id: string): Promise<NewsletterRow | null> {
  const client = await createClient();
  const { data, error } = await client
    .from("newsletters")
    .select("id, subject, slug, preview_text, content, status, created_at, updated_at, sent_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getNewsletterById]", error);
    return null;
  }
  if (!data) return null;
  const row = data as Omit<NewsletterRow, "date">;
  return {
    ...row,
    date: row.status === "sent" && row.sent_at ? row.sent_at : row.created_at,
  };
}

export async function getNewsletterBySlug(slug: string): Promise<NewsletterRow | null> {
  const client = await createClient();
  const { data, error } = await client
    .from("newsletters")
    .select("id, subject, slug, preview_text, content, status, created_at, updated_at, sent_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getNewsletterBySlug]", error);
    return null;
  }
  if (!data) return null;
  const row = data as Omit<NewsletterRow, "date">;
  return {
    ...row,
    date: row.status === "sent" && row.sent_at ? row.sent_at : row.created_at,
  };
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
  let target_config: Record<string, unknown> = {};
  try {
    const raw = formData.get("target_config");
    if (typeof raw === "string" && raw) target_config = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // keep default
  }

  if (!subject) return { error: "Subject is required." };

  const { data, error } = await client
    .from("newsletters")
    .insert({
      subject,
      slug: slug || null,
      preview_text: preview_text || null,
      content: content || null,
      status,
      target_config,
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

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM ?? "House Of Tech <newsletter@emails.hot.tech>";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function getNewsletterBySlugOrId(slugOrId: string): Promise<NewsletterRow | null> {
  return UUID_REGEX.test(slugOrId) ? getNewsletterById(slugOrId) : getNewsletterBySlug(slugOrId);
}

export async function sendTestEmail(
  slug: string,
  email: string
): Promise<{ error?: string }> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Unauthorized." };

  const newsletter = await getNewsletterBySlugOrId(slug);
  if (!newsletter) return { error: "Newsletter not found." };

  if (!process.env.RESEND_API_KEY) return { error: "RESEND_API_KEY is not set." };

  const subject = newsletter.subject ?? "Newsletter";
  const slugVal = newsletter.slug ?? newsletter.id;
  const baseUrl = getBaseUrl();

  const { data: subscriber } = await client
    .from("subscribers")
    .select("id")
    .eq("email", email.trim())
    .maybeSingle();
  const unsubscribeUrl = subscriber?.id
    ? `${baseUrl}/unsubscribe?id=${subscriber.id}`
    : `${baseUrl}/unsubscribe?id=test-preview-id`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [email.trim()],
    subject: `[TEST] ${subject}`,
    react: WeeklyNewsletter({
      subject,
      previewText: newsletter.preview_text ?? subject,
      content: newsletter.content ?? "",
      slug: slugVal,
      email: email.trim(),
      unsubscribeUrl,
      baseUrl,
    }),
  });

  if (error) {
    console.error("[sendTestEmail]", error);
    return { error: error.message };
  }
  return {};
}

export async function broadcastNewsletter(slug: string): Promise<{ error?: string; count?: number }> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Unauthorized." };

  const newsletter = await getNewsletterBySlugOrId(slug);
  if (!newsletter) return { error: "Newsletter not found." };

  const { data: subscribers, error: subsError } = await client
    .from("subscribers")
    .select("id, email")
    .eq("status", "active");

  if (subsError) {
    console.error("[broadcastNewsletter] subscribers", subsError);
    return { error: "Failed to load subscribers." };
  }
  const subscriberList = (subscribers ?? []) as { id: string; email: string }[];
  const filtered = subscriberList.filter((s) => s.email);
  if (filtered.length === 0) return { error: "No active subscribers." };

  if (!process.env.RESEND_API_KEY) return { error: "RESEND_API_KEY is not set." };

  const subject = newsletter.subject ?? "Newsletter";
  const slugVal = newsletter.slug ?? newsletter.id;
  const baseUrl = getBaseUrl();

  for (const subscriber of filtered) {
    const unsubscribeUrl = `${baseUrl}/unsubscribe?id=${subscriber.id}`;
    console.log("[broadcastNewsletter] unsubscribe URL:", unsubscribeUrl);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [subscriber.email],
      subject,
      headers: {
        "List-Unsubscribe": unsubscribeUrl,
      },
      react: WeeklyNewsletter({
        subject,
        previewText: newsletter.preview_text ?? subject,
        content: newsletter.content ?? "",
        slug: slugVal,
        email: subscriber.email,
        unsubscribeUrl,
        baseUrl,
      }),
    });
    if (error) {
      console.error("[broadcastNewsletter]", error);
      return { error: `Failed to send to ${subscriber.email}: ${error.message}`, count: 0 };
    }
  }

  const sentAt = new Date().toISOString();
  const { error: updateError } = await client
    .from("newsletters")
    .update({ status: "sent", sent_at: sentAt, updated_at: sentAt })
    .eq("id", newsletter.id);

  if (updateError) {
    console.error("[broadcastNewsletter] update status", updateError);
    return { error: "Emails sent but status update failed.", count: filtered.length };
  }

  return { count: filtered.length };
}
