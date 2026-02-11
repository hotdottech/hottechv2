import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";
import { getBaseUrl } from "@/lib/url";

const FALLBACK_TITLE = "House of Tech";
const FALLBACK_DESCRIPTION = "Tech Reviews & News";
const FALLBACK_OG_IMAGE = "/og-image.jpg";

const DEFAULT_TEMPLATE_POST = "{{title}} | {{site_title}}";
const DEFAULT_TEMPLATE_ARCHIVE = "{{title}} Archives | {{site_title}}";
const DEFAULT_TEMPLATE_PAGE = "{{title}} | {{site_title}}";

export type ConstructMetadataParams = {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  canonical?: string | null;
  templateType?: "post" | "archive" | "page";
  category?: string | null;
};

/**
 * Replace {{key}} placeholders in template with values from variables.
 * Unknown or missing keys are replaced with an empty string.
 */
export function compileSeoTitle(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(variables, key)
      ? String(variables[key] ?? "")
      : ""
  ).replace(/\s+/g, " ").trim();
}

/** Build Next.js Metadata for a page. Uses cached site_settings for defaults. */
export async function constructMetadata({
  title,
  description,
  image,
  type = "website",
  canonical,
  templateType,
  category,
}: ConstructMetadataParams = {}): Promise<Metadata> {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const settings = await getSiteSettings();

  const defaultTitle = (settings?.seo_title ?? FALLBACK_TITLE).trim() || FALLBACK_TITLE;
  const defaultDescription =
    (settings?.seo_description ?? FALLBACK_DESCRIPTION).trim() || FALLBACK_DESCRIPTION;
  const defaultImage =
    (settings?.default_og_image ?? "").trim() || FALLBACK_OG_IMAGE;
  const twitterHandle = (settings?.social_twitter ?? "").trim() || undefined;

  let resolvedTitle: string;
  if (templateType) {
    const rawTemplate =
      templateType === "post"
        ? (settings?.seo_template_post ?? DEFAULT_TEMPLATE_POST).trim() || DEFAULT_TEMPLATE_POST
        : templateType === "archive"
          ? (settings?.seo_template_archive ?? DEFAULT_TEMPLATE_ARCHIVE).trim() || DEFAULT_TEMPLATE_ARCHIVE
          : (settings?.seo_template_page ?? DEFAULT_TEMPLATE_PAGE).trim() || DEFAULT_TEMPLATE_PAGE;
    const variables: Record<string, string> = {
      title: (title ?? "").trim(),
      site_title: defaultTitle,
      excerpt: (description ?? "").trim(),
      category: (category ?? "").trim(),
    };
    resolvedTitle = compileSeoTitle(rawTemplate, variables) || defaultTitle;
  } else {
    resolvedTitle = (title ?? "").trim() || defaultTitle;
  }
  const resolvedDescription = (description ?? "").trim() || defaultDescription;
  const resolvedImage =
    (image ?? "").trim() && (image ?? "").startsWith("http")
      ? (image ?? "").trim()
      : (image ?? "").trim()
        ? `${baseUrl}/${(image ?? "").trim().replace(/^\//, "")}`
        : defaultImage.startsWith("http")
          ? defaultImage
          : `${baseUrl}${defaultImage.startsWith("/") ? "" : "/"}${defaultImage}`;

  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${defaultTitle}`,
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription || undefined,
      images: [resolvedImage],
      type,
      siteName: defaultTitle,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription || undefined,
      images: [resolvedImage],
      ...(twitterHandle && { creator: twitterHandle, site: twitterHandle }),
    },
  };

  if (resolvedTitle !== defaultTitle) {
    metadata.title = resolvedTitle;
  }

  if (resolvedDescription) {
    metadata.description = resolvedDescription;
  }

  if (canonical?.trim()) {
    const canonicalUrl = canonical.startsWith("http")
      ? canonical
      : `${baseUrl}/${canonical.replace(/^\//, "")}`;
    metadata.alternates = { canonical: canonicalUrl };
  }

  return metadata;
}
