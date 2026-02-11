import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/url";

function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ?? getBaseUrl();
  return raw.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/private/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
