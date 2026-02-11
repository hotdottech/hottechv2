import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const AUTHORY_FEED_URL = "https://authory.com/hot/rss";
const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/1a1a1a/FFF";

type AuthoryRssItem = Parser.Item & {
  source?: string;
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  itunesImage?: unknown;
  contentEncoded?: unknown;
  enclosure?: { url?: string };
};

/** Extract first img src from HTML string, or null. */
function extractImageFromContent(html: string | undefined): string | null {
  if (!html || typeof html !== "string") return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/** Return a clean publisher name from a URL. */
function getPublisherFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("forbes.com")) return "Forbes";
  if (lower.includes("androidcentral.com")) return "Android Central";
  if (lower.includes("techradar.com")) return "TechRadar";
  if (lower.includes("tomsguide.com")) return "Tom's Guide";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("instagram.com")) return "Instagram";
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (!hostname) return "Authory";
    const name = hostname.split(".")[0] ?? hostname;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  } catch {
    return "Authory";
  }
}

/** Get image URL from Authory RSS item. */
function getImageFromAuthoryItem(item: AuthoryRssItem): string {
  const itunesImg = item.itunesImage as { href?: string; $?: { href?: string } } | undefined;
  const itunesHref = itunesImg?.href || itunesImg?.$?.href;
  if (itunesHref) return itunesHref;
  const mcAttr = (item.mediaContent as { $?: { url?: string } } | undefined)?.$?.url;
  if (mcAttr && typeof mcAttr === "string") return mcAttr;
  const mcUrl = (item.mediaContent as { url?: string } | undefined)?.url;
  if (mcUrl && typeof mcUrl === "string") return mcUrl;
  const mtAttr = (item.mediaThumbnail as { $?: { url?: string } } | undefined)?.$?.url;
  if (mtAttr && typeof mtAttr === "string") return mtAttr;
  const mtUrl = (item.mediaThumbnail as { url?: string } | undefined)?.url;
  if (mtUrl && typeof mtUrl === "string") return mtUrl;
  const enclosureUrl = item.enclosure?.url;
  if (enclosureUrl && typeof enclosureUrl === "string") return enclosureUrl;
  const html = (item.contentEncoded as string | undefined) ?? item.content;
  const fromContent = extractImageFromContent(typeof html === "string" ? html : undefined);
  if (fromContent) return fromContent;
  return PLACEHOLDER_IMAGE;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

/** URL-safe slug from title (lowercase, spaces to dashes, strip non-alphanumeric). */
function slugify(title: string, suffix?: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const slug = base || "post";
  return suffix ? `${slug}-${suffix}` : slug;
}

/** Extract last path segment from URL as slug (e.g. .../my-cool-post/ → my-cool-post). */
function extractSlugFromUrl(url: string, titleFallback: string): string {
  if (!url || typeof url !== "string") return slugify(titleFallback);
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && /^[a-z0-9-]+$/i.test(last)) return last.toLowerCase();
  } catch {
    // ignore
  }
  return slugify(titleFallback);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const parser = new Parser({
      customFields: {
        item: [
          ["media:content", "mediaContent"],
          ["media:thumbnail", "mediaThumbnail"],
          ["enclosure", "enclosure"],
          ["itunes:image", "itunesImage"],
          ["content:encoded", "contentEncoded"],
        ],
      },
    });

    // Step 1: Fetch & Sanitize
    const response = await fetch(AUTHORY_FEED_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok)
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    const xmlText = await response.text();
    console.log("Raw Feed Start:", xmlText.substring(0, 200));
    const cleanXml = xmlText.replace(/&(?!(?:apos|quot|[gl]t|amp);|#)/g, "&amp;");
    console.log("Feed fetched and sanitized");

    // Step 2: Parse
    const feed = await parser.parseString(cleanXml);
    const items = (feed.items ?? []) as AuthoryRssItem[];
    const itemsToProcess = items.slice(0, 5);
    let added = 0;
    let skipped = 0;

    // Step 3: Loop & Upsert (limit to first 5)
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      const guid = item.guid ?? item.link ?? null;
      if (!guid) continue;

      const title = item.title?.trim() ?? "Untitled";
      const link = item.link ?? "";
      const slugBase = extractSlugFromUrl(link, title);
      const slugSuffix =
        (typeof guid === "string" ? guid.slice(-8) : String(guid).slice(-8)).replace(
          /[^a-z0-9]/gi,
          ""
        ) || Date.now().toString(36);
      let slug = slugBase ? `${slugBase}-${slugSuffix}` : slugify(title, slugSuffix);

      const { data: slugExists } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (slugExists) {
        slug = slugBase ? `${slugBase}-${slugSuffix}-${Date.now().toString(36)}` : slugify(title, `${slugSuffix}-${Date.now().toString(36)}`);
      }

      const rawDate = item.isoDate ?? new Date().toISOString();
      const published_at = new Date(rawDate).toISOString();
      const snippet = item.contentSnippet?.trim() ?? null;
      const featured_image = getImageFromAuthoryItem(item);
      const original_url = link || null;

      if (i === 0) {
        console.log("[ingest] First item — Date:", published_at, "Image:", featured_image);
      }

      const { error } = await supabase.from("posts").insert({
        title,
        slug,
        featured_image,
        source_name: getPublisherFromUrl(link),
        original_url,
        excerpt: snippet,
        summary: snippet,
        content: "",
        published_at,
        created_at: published_at,
        status: "published",
        guid,
        meta_title: title,
        meta_description: snippet,
        canonical_url: link || null,
        type: "external",
      });

      if (error) {
        if (error.code === "23505") {
          skipped++;
          continue;
        }
        console.error("[ingest] post insert error:", error);
        continue;
      }
      added++;
    }

    return NextResponse.json({ success: true, added, skipped });
  } catch (e) {
    console.error("[ingest]", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Ingest failed" },
      { status: 500 }
    );
  }
}
