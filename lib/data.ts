import Parser from "rss-parser";
import { parseISO } from "date-fns";
import { client, urlFor } from "./sanity";
import type { FeedItem } from "./types";

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

/** Get image URL from Authory RSS item (iTunes + media + enclosure + content regex). */
function getImageFromAuthoryItem(item: AuthoryRssItem): string {
  // 1. Check iTunes Image (often nested in $)
  const itunesImg = item.itunesImage as { href?: string; $?: { href?: string } } | undefined;
  const itunesHref = itunesImg?.href || itunesImg?.$?.href;
  if (itunesHref) return itunesHref;

  // Check 2: mediaContent attribute object (parser often maps XML attrs to $)
  const mcAttr = (item.mediaContent as { $?: { url?: string } } | undefined)?.$?.url;
  if (mcAttr && typeof mcAttr === "string") return mcAttr;

  // Check 3: mediaContent direct url property
  const mcUrl = (item.mediaContent as { url?: string } | undefined)?.url;
  if (mcUrl && typeof mcUrl === "string") return mcUrl;

  // Check 4: mediaThumbnail (attr or direct)
  const mtAttr = (item.mediaThumbnail as { $?: { url?: string } } | undefined)?.$?.url;
  if (mtAttr && typeof mtAttr === "string") return mtAttr;
  const mtUrl = (item.mediaThumbnail as { url?: string } | undefined)?.url;
  if (mtUrl && typeof mtUrl === "string") return mtUrl;

  // Check 5: enclosure
  const enclosureUrl = item.enclosure?.url;
  if (enclosureUrl && typeof enclosureUrl === "string") return enclosureUrl;

  // Check 6: regex on contentEncoded or content
  const html =
    (item.contentEncoded as string | undefined) ?? item.content;
  const fromContent = extractImageFromContent(
    typeof html === "string" ? html : undefined
  );
  if (fromContent) return fromContent;

  return PLACEHOLDER_IMAGE;
}

type AuthoryRssItem = Parser.Item & {
  source?: string;
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  itunesImage?: unknown;
  contentEncoded?: unknown;
};

/** Map Authory RSS item to FeedItem with video/social detection. */
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

const SANITY_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  mainImage,
  "author": author->name
}`;

type SanityPostResult = {
  _id: string;
  title: string | null;
  slug: string | null;
  publishedAt: string | null;
  excerpt: string | null;
  mainImage: unknown;
  author: string | null;
};

export async function getSanityPosts(): Promise<FeedItem[]> {
  try {
    const posts = (await client.fetch<SanityPostResult[]>(SANITY_POSTS_QUERY)) ?? [];
    return posts.map((post) => {
      const slug = post.slug ?? post._id;
      const imageUrl = post.mainImage
        ? urlFor(post.mainImage).width(800).url()
        : PLACEHOLDER_IMAGE;
      const date = post.publishedAt ?? new Date().toISOString();
      return {
        id: post._id,
        title: post.title ?? "Untitled",
        excerpt: post.excerpt ?? undefined,
        date,
        type: "post",
        source: "internal",
        url: `/${slug}`,
        image: imageUrl,
        publisher: post.author ?? "Hot Tech",
      };
    });
  } catch (err) {
    console.error("[getSanityPosts]", err);
    return [];
  }
}

const SANITY_POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  body,
  mainImage,
  "author": author->{ name, image },
  "categories": categories[]->{ title, "slug": slug.current },
  "imageUrl": mainImage.asset->url
}`;

export type SanityPost = {
  _id: string;
  title: string | null;
  slug: string | null;
  publishedAt: string | null;
  excerpt: string | null;
  body: unknown;
  mainImage: unknown;
  author: { name: string | null; image: unknown } | null;
  categories: { title: string | null; slug: string | null }[];
  imageUrl: string | null;
};

export async function getPost(slug: string): Promise<SanityPost | null> {
  try {
    const post = await client.fetch<SanityPost | null>(SANITY_POST_BY_SLUG_QUERY, { slug });
    return post ?? null;
  } catch (err) {
    console.error("[getPost]", err);
    return null;
  }
}

const SANITY_NEWSLETTER_BY_SLUG_QUERY = `*[_type == "newsletter" && slug.current == $slug][0] {
  ...,
  "slug": slug.current,
  body[] {
    ...,
    _type == 'reference' => {
      "post": @->{
        title,
        "slug": slug.current,
        mainImage,
        excerpt
      }
    }
  }
}`;

export type NewsletterBodyBlock =
  | { _key: string; _type: "block"; children?: unknown[]; markDefs?: unknown[] }
  | { _key: string; _type: "reference"; post: { title: string | null; slug: string | null; mainImage: unknown; excerpt: string | null } | null }
  | { _key: string; _type: "externalLink"; title?: string | null; url?: string | null; description?: string | null; image?: unknown }
  | { _key: string; _type: "sectionHeader"; title?: string | null };

export type SanityNewsletter = {
  _id: string;
  subject: string | null;
  slug: string | null;
  publishedAt: string | null;
  previewText: string | null;
  body: NewsletterBodyBlock[] | null;
};

const SANITY_NEWSLETTERS_LIST_QUERY = `*[_type == "newsletter"] | order(publishedAt desc) {
  _id,
  subject,
  "slug": slug.current,
  publishedAt
}`;

export type SanityNewsletterListItem = {
  _id: string;
  subject: string | null;
  slug: string | null;
  publishedAt: string | null;
};

export async function getNewsletters(): Promise<SanityNewsletterListItem[]> {
  try {
    const docs = await client.fetch<SanityNewsletterListItem[]>(SANITY_NEWSLETTERS_LIST_QUERY);
    return Array.isArray(docs) ? docs : [];
  } catch (err) {
    console.error("[getNewsletters]", err);
    return [];
  }
}

export async function getNewsletter(slug: string): Promise<SanityNewsletter | null> {
  try {
    const doc = await client.fetch<SanityNewsletter | null>(SANITY_NEWSLETTER_BY_SLUG_QUERY, { slug });
    return doc ?? null;
  } catch (err) {
    console.error("[getNewsletter]", err);
    return null;
  }
}

export async function getUnifiedFeed(): Promise<FeedItem[]> {
  const [internalPosts, authoryItems] = await Promise.all([
    getSanityPosts(),
    getAuthoryFeed(),
  ]);

  const merged = [...internalPosts, ...authoryItems];
  const sorted = merged.sort((a, b) => {
    const dateA = parseISO(a.date).getTime();
    const dateB = parseISO(b.date).getTime();
    return dateB - dateA; // descending (newest first)
  });

  console.log("[getUnifiedFeed] mixed content:", sorted);
  return sorted;
}
