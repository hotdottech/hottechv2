"use server";

import { createClient } from "@/utils/supabase/server";

export type TargetConfig = {
  type: "all" | "filter" | "manual";
  filters?: { sources: string[]; tags: string[] };
  manual_ids?: string[];
};

export type AudienceMetadata = {
  sources: string[];
  tags: string[];
  totalActive: number;
};

export async function getAudienceMetadata(): Promise<AudienceMetadata> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { sources: [], tags: [], totalActive: 0 };

  const { data: rows, error } = await client
    .from("subscribers")
    .select("source, preferences")
    .eq("status", "active");

  if (error) {
    console.error("[getAudienceMetadata]", error);
    return { sources: [], tags: [], totalActive: 0 };
  }

  const sourcesSet = new Set<string>();
  const tagsSet = new Set<string>();
  for (const row of rows ?? []) {
    const src = (row as { source?: string | null }).source;
    if (src && typeof src === "string") sourcesSet.add(src.trim());
    const prefs = (row as { preferences?: { segments?: string[] } | null }).preferences;
    const segments = prefs?.segments;
    if (Array.isArray(segments)) {
      for (const t of segments) {
        if (typeof t === "string" && t.trim()) tagsSet.add(t.trim());
      }
    }
  }

  return {
    sources: Array.from(sourcesSet).sort(),
    tags: Array.from(tagsSet).sort(),
    totalActive: rows?.length ?? 0,
  };
}

export async function searchSubscribers(
  query: string
): Promise<{ id: string; email: string; source: string | null }[]> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return [];

  const q = (query ?? "").trim().toLowerCase();
  if (!q) return [];

  const { data, error } = await client
    .from("subscribers")
    .select("id, email, source")
    .eq("status", "active")
    .ilike("email", `%${q}%`)
    .limit(10);

  if (error) {
    console.error("[searchSubscribers]", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: (r as { id: string }).id,
    email: (r as { email: string }).email,
    source: (r as { source: string | null }).source ?? null,
  }));
}

export async function calculateRecipientCount(
  config: TargetConfig
): Promise<number> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return 0;

  if (config.type === "manual") {
    const ids = config.manual_ids ?? [];
    if (ids.length === 0) return 0;
    const { count, error } = await client
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .in("id", ids);
    if (error) return 0;
    return count ?? 0;
  }

  if (config.type === "all") {
    const { count, error } = await client
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");
    if (error) return 0;
    return count ?? 0;
  }

  if (config.type === "filter") {
    const filters = config.filters ?? { sources: [], tags: [] };
    const sources = filters.sources ?? [];
    const tags = filters.tags ?? [];
    if (sources.length === 0 && tags.length === 0) return 0;

    const { data: rows, error } = await client
      .from("subscribers")
      .select("id, source, preferences")
      .eq("status", "active");

    if (error || !rows) return 0;

    const count = rows.filter((row) => {
      const r = row as { source?: string | null; preferences?: { segments?: string[] } | null };
      const matchSource = sources.length === 0 || (r.source && sources.includes(r.source));
      const segs = r.preferences?.segments;
      const matchTags =
        tags.length === 0 ||
        (Array.isArray(segs) && tags.some((t) => segs.includes(t)));
      return matchSource || matchTags;
    }).length;
    return count;
  }

  return 0;
}
