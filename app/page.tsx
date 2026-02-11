import {
  getUnifiedFeed,
  getSiteSettings,
  getPostsByIds,
  getSmartFeedPosts,
} from "@/lib/data";
import type {
  FeatureGridBlockData,
  TimelineBlockData,
  SmartFeedBlockData,
  HomepageBlock,
} from "@/lib/types";
import { Hero } from "@/components/home/hero";
import { FeedGrid } from "@/components/home/feed-grid";
import { Timeline } from "@/components/home/Timeline";
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

  const layout: HomepageBlock[] = settings?.homepage_layout ?? [];

  const featureGridBlocks = layout.filter(
    (b) => b.type === "feature_grid" && b.enabled
  );
  const gridItemsByBlockId: Record<string, Awaited<ReturnType<typeof getPostsByIds>>> = {};
  if (featureGridBlocks.length > 0) {
    const results = await Promise.all(
      featureGridBlocks.map((b) =>
        getPostsByIds(
          ((b.data as FeatureGridBlockData)?.postIds ?? []) as string[]
        )
      )
    );
    featureGridBlocks.forEach((b, i) => {
      gridItemsByBlockId[b.id] = results[i];
    });
  }

  const smartFeedBlocks = layout.filter(
    (b) => b.type === "smart_feed" && b.enabled
  );
  const smartFeedItemsByBlockId: Record<string, Awaited<ReturnType<typeof getSmartFeedPosts>>> = {};
  if (smartFeedBlocks.length > 0) {
    const results = await Promise.all(
      smartFeedBlocks.map((b) =>
        getSmartFeedPosts((b.data as SmartFeedBlockData) ?? {})
      )
    );
    smartFeedBlocks.forEach((b, i) => {
      smartFeedItemsByBlockId[b.id] = results[i];
    });
  }

  return (
    <>
      <ReactiveBackground />
      <Navbar settings={settings} />
      <main className="min-h-screen pt-20">
        {layout
          .filter((b) => b.enabled)
          .map((block) => {
            if (block.type === "hero") {
              return <Hero key={block.id} data={block.data} />;
            }
            if (block.type === "timeline") {
              return (
                <Timeline
                  key={block.id}
                  data={block.data as TimelineBlockData}
                />
              );
            }
            if (block.type === "feature_grid") {
              const data = block.data as FeatureGridBlockData | undefined;
              const items = gridItemsByBlockId[block.id] ?? [];
              const sectionTitle = data?.sectionTitle?.trim() ?? "";
              return (
                <FeedGrid
                  key={block.id}
                  items={items}
                  sectionTitle={sectionTitle || undefined}
                />
              );
            }
            if (block.type === "smart_feed") {
              const data = block.data as SmartFeedBlockData | undefined;
              const items = smartFeedItemsByBlockId[block.id] ?? [];
              const sectionTitle = data?.title?.trim() ?? "";
              return (
                <FeedGrid
                  key={block.id}
                  items={items}
                  sectionTitle={sectionTitle || undefined}
                />
              );
            }
            return null;
          })}
        <SocialPresence />
      </main>
      <Footer />
    </>
  );
}
