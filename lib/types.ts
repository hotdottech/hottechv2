export interface FeedItem {
  id: string;
  title: string;
  excerpt?: string;
  date: string; // ISO format
  type: "post" | "video" | "external-article" | "social";
  source: "internal" | "external";
  url: string;
  image?: string; // optional URL
  publisher?: string; // e.g. "Forbes", "YouTube"
}
