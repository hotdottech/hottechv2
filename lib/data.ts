import Parser from "rss-parser";
import { parseISO } from "date-fns";
import { supabase } from "./supabase";
import type { FeedItem, SiteSettings } from "./types";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/1a1a1a/FFF";
const AUTHORY_FEED_URL = "https://authory.com/hot/rss";

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

type AuthoryRssItem = Parser.Item & {
  source?: string;
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  itunesImage?: unknown;
  contentEncoded?: unknown;
};

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

function mapRssItemToFeedItem(item: AuthoryRssItem, index: number): FeedItem {
  const link = item.link ?? "";
  const linkLower = link.toLowerCase();
  let type: FeedItem["type"];
  if (linkLower.includes("youtube.com") || linkLower.includes("youtu.be")) {
    type = "video";
  } else if (linkLower.includes("instagram.com")) {
    type = "social";
  } else {
    type = "external-article";
  }
  const publisher = getPublisherFromUrl(link);
  const image = getImageFromAuthoryItem(item);
  const date = item.isoDate ?? item.pubDate ?? new Date().toISOString();
  const rawId = item.guid ?? `authory-${index}-${date}`;
  const id = typeof rawId === "string" ? rawId : String(rawId);
  return {
    id,
    title: item.title ?? "Untitled",
    excerpt: item.contentSnippet ?? undefined,
    date,
    type,
    source: "external",
    url: link,
    image,
    publisher,
  };
}

export async function getAuthoryFeed(): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(AUTHORY_FEED_URL);
    const items = feed.items ?? [];
    return items.map((item, index) =>
      mapRssItemToFeedItem(item as AuthoryRssItem, index)
    );
  } catch (err) {
    console.error("[getAuthoryFeed]", err);
    return [];
  }
}

/** Published posts from Supabase for the unified feed. */
export async function getSupabasePosts(): Promise<FeedItem[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, main_image, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getSupabasePosts]", error);
    return [];
  }

  return (data ?? []).map((post) => ({
    id: post.id,
    title: post.title ?? "Untitled",
    excerpt: post.excerpt ?? undefined,
    date: post.updated_at ?? post.created_at ?? new Date().toISOString(),
    type: "post" as const,
    source: "internal" as const,
    url: `/${post.slug ?? post.id}`,
    image: post.main_image ?? undefined,
    publisher: "Hot Tech",
  }));
}

export type SupabasePost = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  body: string | null;
  featured_image: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getPostBySlug(slug: string): Promise<SupabasePost | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, content, main_image, status, created_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[getPostBySlug]", error);
    return null;
  }
  if (!data) return null;
  return {
    ...data,
    body: data.content != null ? String(data.content) : null,
    featured_image: data.main_image != null ? String(data.main_image) : null,
  } as SupabasePost;
}

export async function getUnifiedFeed(): Promise<FeedItem[]> {
  const [internalPosts, authoryItems] = await Promise.all([
    getSupabasePosts(),
    getAuthoryFeed(),
  ]);
  const merged = [...internalPosts, ...authoryItems];
  const sorted = merged.sort((a, b) => {
    const dateA = parseISO(a.date).getTime();
    const dateB = parseISO(b.date).getTime();
    return dateB - dateA;
  });
  return sorted;
}

/** Public newsletter by slug (for website archive). */
export type NewsletterPublic = {
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

export async function getNewsletterBySlug(slug: string): Promise<NewsletterPublic | null> {
  const { data, error } = await supabase
    .from("newsletters")
    .select("id, subject, slug, preview_text, content, status, created_at, updated_at, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getNewsletterBySlug]", error);
    return null;
  }
  return data as NewsletterPublic | null;
}

/** Fetch the singleton site settings (id=1). */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
  return data as SiteSettings | null;
}
