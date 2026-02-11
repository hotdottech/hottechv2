"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { Subscriber } from "@/lib/types";

export async function getSubscribers(query?: string): Promise<Subscriber[]> {
  const client = await createClient();
  let q = client
    .from("subscribers")
    .select("id, email, status, created_at, source, preferences")
    .order("created_at", { ascending: false });

  const trimmed = (query ?? "").trim();
  if (trimmed) {
    q = q.ilike("email", `%${trimmed}%`);
  }

  const { data, error } = await q;

  if (error) {
    console.error("Fetch Error:", error.message || error);
    return [];
  }
  return (data ?? []) as Subscriber[];
}

export async function getSubscriberCount(): Promise<number> {
  const client = await createClient();
  const { count, error } = await client
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  if (error) {
    console.error("[getSubscriberCount]", error);
    return 0;
  }
  return count ?? 0;
}

export async function addSubscriber(
  email: string
): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { error: "Email is required." };
  }

  const { data: existing } = await client
    .from("subscribers")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  if (existing) {
    return { error: "That email is already subscribed." };
  }

  const { error } = await client.from("subscribers").insert({
    email: normalized,
    status: "active",
    source: "admin",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That email is already subscribed." };
    }
    console.error("[addSubscriber]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/subscribers");
  return {};
}

export async function deleteSubscriber(id: string): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await client.from("subscribers").delete().eq("id", id);

  if (error) {
    console.error("[deleteSubscriber]", error);
    return { error: error.message };
  }

  revalidatePath("/admin/subscribers");
  return {};
}
