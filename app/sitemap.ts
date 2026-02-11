import type { MetadataRoute } from "next";
import { getPostSlugsForSitemap, getTaxonomySlugsForSitemap } from "@/lib/data";
import { getBaseUrl } from "@/lib/url";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? getBaseUrl();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl().replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [];

  entries.push({
    url: base,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  const [posts, categories, tags, contentTypes] = await Promise.all([
    getPostSlugsForSitemap(),
    getTaxonomySlugsForSitemap("category"),
    getTaxonomySlugsForSitemap("tag"),
    getTaxonomySlugsForSitemap("content_type"),
  ]);

  for (const p of posts) {
    entries.push({
      url: `${base}/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  const archivePriority = 0.5;
  const archiveChange = "weekly" as const;

  for (const slug of categories) {
    entries.push({
      url: `${base}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: archiveChange,
      priority: archivePriority,
    });
  }
  for (const slug of tags) {
    entries.push({
      url: `${base}/tag/${slug}`,
      lastModified: new Date(),
      changeFrequency: archiveChange,
      priority: archivePriority,
    });
  }
  for (const slug of contentTypes) {
    entries.push({
      url: `${base}/type/${slug}`,
      lastModified: new Date(),
      changeFrequency: archiveChange,
      priority: archivePriority,
    });
  }

  return entries;
}
