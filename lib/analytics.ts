"use server";

import { createClient } from "@/utils/supabase/server";
import { format, subDays, eachDayOfInterval } from "date-fns";

export type ChartDataPoint = {
  date: string;
  subscribers: number;
  opens: number;
};

export type TopPostRow = {
  post_id: string;
  title: string;
  slug: string | null;
  total_views: number;
  unique_visitors: number;
};

export type TopNewsletterRow = {
  newsletter_id: string;
  subject: string;
  sent_at: string | null;
  total_opens: number;
  unique_opens: number;
};

/**
 * Chart data: subscribers and newsletter opens per day over the last `days`.
 */
export async function getChartData(days: number = 30): Promise<ChartDataPoint[]> {
  const end = new Date();
  const start = subDays(end, days);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const supabase = await createClient();

  const [subsRes, opensRes] = await Promise.all([
    supabase
      .from("subscribers")
      .select("created_at")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    supabase
      .from("newsletter_events")
      .select("created_at")
      .eq("type", "OPEN")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
  ]);

  const subsByDay: Record<string, number> = {};
  const opensByDay: Record<string, number> = {};

  const dayKeys = eachDayOfInterval({ start, end }).map((d) => {
    const k = format(d, "yyyy-MM-dd");
    subsByDay[k] = 0;
    opensByDay[k] = 0;
    return k;
  });

  for (const row of subsRes.data ?? []) {
    const at = (row as { created_at?: string }).created_at;
    if (at) {
      const k = format(new Date(at), "yyyy-MM-dd");
      if (k in subsByDay) subsByDay[k] += 1;
    }
  }
  for (const row of opensRes.data ?? []) {
    const at = (row as { created_at?: string }).created_at;
    if (at) {
      const k = format(new Date(at), "yyyy-MM-dd");
      if (k in opensByDay) opensByDay[k] += 1;
    }
  }

  return dayKeys.map((k) => ({
    date: format(new Date(k), "MMM d"),
    subscribers: subsByDay[k] ?? 0,
    opens: opensByDay[k] ?? 0,
  }));
}

/**
 * Top 20 posts by total views (post_analytics joined with posts).
 */
export async function getTopPosts(): Promise<TopPostRow[]> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("post_analytics")
    .select("post_id, visitor_id");

  if (error) {
    console.error("[getTopPosts]", error);
    return [];
  }

  const byPost: Record<
    string,
    { total: number; visitors: Set<string> }
  > = {};
  for (const r of rows ?? []) {
    const pid = (r as { post_id: string; visitor_id: string }).post_id;
    const vid = (r as { post_id: string; visitor_id: string }).visitor_id;
    if (!byPost[pid]) byPost[pid] = { total: 0, visitors: new Set() };
    byPost[pid].total += 1;
    byPost[pid].visitors.add(vid);
  }

  const sorted = Object.entries(byPost)
    .map(([post_id, agg]) => ({
      post_id,
      total_views: agg.total,
      unique_visitors: agg.visitors.size,
    }))
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 20);

  if (sorted.length === 0) return [];

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug")
    .in("id", sorted.map((s) => s.post_id));

  const postMap = new Map(
    (posts ?? []).map((p) => [
      (p as { id: string }).id,
      p as { id: string; title: string; slug: string | null },
    ])
  );

  return sorted.map((s) => {
    const p = postMap.get(s.post_id);
    return {
      post_id: s.post_id,
      title: p?.title ?? "—",
      slug: p?.slug ?? null,
      total_views: s.total_views,
      unique_visitors: s.unique_visitors,
    };
  });
}

/**
 * Top 20 sent newsletters by total opens (newsletters + newsletter_events).
 */
export async function getTopNewsletters(): Promise<TopNewsletterRow[]> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("newsletter_events")
    .select("newsletter_id, recipient_id")
    .eq("type", "OPEN");

  if (error) {
    console.error("[getTopNewsletters]", error);
    return [];
  }

  const byNewsletter: Record<
    string,
    { total: number; recipients: Set<string> }
  > = {};
  for (const r of rows ?? []) {
    const nid = (r as { newsletter_id: string; recipient_id: string | null })
      .newsletter_id;
    const rid = (r as { newsletter_id: string; recipient_id: string | null })
      .recipient_id ?? "";
    if (!byNewsletter[nid]) byNewsletter[nid] = { total: 0, recipients: new Set() };
    byNewsletter[nid].total += 1;
    byNewsletter[nid].recipients.add(rid);
  }

  const sorted = Object.entries(byNewsletter)
    .map(([newsletter_id, agg]) => ({
      newsletter_id,
      total_opens: agg.total,
      unique_opens: agg.recipients.size,
    }))
    .sort((a, b) => b.total_opens - a.total_opens)
    .slice(0, 20);

  if (sorted.length === 0) return [];

  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("id, subject, sent_at")
    .in("id", sorted.map((s) => s.newsletter_id));

  const nlMap = new Map(
    (newsletters ?? []).map((n) => [
      (n as { id: string }).id,
      n as { id: string; subject: string | null; sent_at: string | null },
    ])
  );

  return sorted.map((s) => {
    const n = nlMap.get(s.newsletter_id);
    return {
      newsletter_id: s.newsletter_id,
      subject: n?.subject ?? "—",
      sent_at: n?.sent_at ?? null,
      total_opens: s.total_opens,
      unique_opens: s.unique_opens,
    };
  });
}
