import { getUnifiedFeed, getSiteSettings, getPostsByIds } from "@/lib/data";
import type { FeatureGridBlockData } from "@/lib/types";
import { Hero } from "@/components/home/hero";
import { FeedGrid } from "@/components/home/feed-grid";
import { SocialPresence } from "@/components/home/social-presence";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReactiveBackground } from "@/components/layout/reactive-background";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const [feed, settings] = await Promise.all([
    getUnifiedFeed(),
    getSiteSettings(),
  ]);

  const heroBlock = settings?.homepage_layout?.find(
    (b) => b.type === "hero" && b.enabled
  );
  const heroData = heroBlock?.data;

  const featureGridBlock = settings?.homepage_layout?.find(
    (b) => b.type === "feature_grid" && b.enabled
  );
  const featureGridData = featureGridBlock?.data as FeatureGridBlockData | undefined;
  const pinnedPostIds = featureGridData?.postIds ?? [];
  const usePinnedGrid = pinnedPostIds.length > 0;

  const gridItems = usePinnedGrid
    ? await getPostsByIds(pinnedPostIds)
    : feed;
  const gridSectionTitle = usePinnedGrid
    ? (featureGridData?.sectionTitle?.trim() ?? "")
    : undefined;

  return (
    <>
      <ReactiveBackground />
      <Navbar settings={settings} />
      <main className="min-h-screen pt-20">
        <Hero data={heroData} />
        <FeedGrid items={gridItems} sectionTitle={gridSectionTitle} />
        <SocialPresence />
      </main>
      <Footer />
    </>
  );
}
