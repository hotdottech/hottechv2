/**
 * Sanity Studio under the authenticated admin area.
 * Catch-all route: /admin/content and /admin/content/...
 *
 * @see https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return (
    <div className="relative flex h-full w-full flex-col">
      <NextStudio config={config} style={{ height: "100%" }} />
    </div>
  );
}
