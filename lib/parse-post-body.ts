import type { SponsorBlockData } from "@/lib/types/post";
import { DEFAULT_SPONSOR_BLOCK_DATA } from "@/lib/types/post";

export type PostBodySegment =
  | { type: "html"; content: string }
  | { type: "sponsor"; data: SponsorBlockData };

/** Decode HTML entities in attribute value so JSON.parse works. */
function decodeAttrValue(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Finds sponsor block divs in HTML and extracts data-sponsor JSON.
 * Handles attribute order (data-type / data-sponsor either way) and HTML entities.
 */
function extractSponsorBlocks(
  html: string
): { segments: PostBodySegment[]; sponsorData: SponsorBlockData[] } {
  const sponsorData: SponsorBlockData[] = [];
  const placeholder = "___SPONSOR_PLACEHOLDER___";

  // Attribute order can be data-type then data-sponsor, or the reverse
  const sponsorBlockRegex =
    /<div\s[^>]*(?:data-type="sponsor-block"[^>]*data-sponsor="((?:[^"\\]|\\.)*)"|data-sponsor="((?:[^"\\]|\\.)*)"[^>]*data-type="sponsor-block")[^>]*>[\s\S]*?<\/div>/gi;

  let lastIndex = 0;
  const parts: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = sponsorBlockRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const rawJson = (match[1] ?? match[2] ?? "").replace(/\\"/g, '"');
    const jsonStr = decodeAttrValue(rawJson);
    try {
      const data = JSON.parse(jsonStr) as SponsorBlockData;
      sponsorData.push({ ...DEFAULT_SPONSOR_BLOCK_DATA, ...data });
      parts.push(html.slice(lastIndex, match.index), placeholder);
      lastIndex = match.index + fullMatch.length;
    } catch {
      parts.push(html.slice(lastIndex, match.index), fullMatch);
      lastIndex = match.index + fullMatch.length;
    }
  }

  if (lastIndex === 0 && sponsorData.length === 0) {
    return { segments: [{ type: "html", content: html }], sponsorData: [] };
  }

  parts.push(html.slice(lastIndex));

  const segments: PostBodySegment[] = [];
  let sponsorIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === placeholder) {
      segments.push({ type: "sponsor", data: sponsorData[sponsorIndex++] });
    } else if (part) {
      segments.push({ type: "html", content: part });
    }
  }

  return { segments, sponsorData };
}

/**
 * Parse post body HTML into segments: raw HTML and sponsor block data.
 * Use with BlockRenderer so sponsor blocks render as <SponsorBlock />.
 */
export function parsePostBody(html: string): PostBodySegment[] {
  const { segments } = extractSponsorBlocks(html);
  return segments;
}
