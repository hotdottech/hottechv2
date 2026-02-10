import { getUnifiedFeed } from "@/lib/data";
import { Hero } from "@/components/home/hero";
import { FeedGrid } from "@/components/home/feed-grid";
import { SocialPresence } from "@/components/home/social-presence";

export default async function Home() {
  const feed = await getUnifiedFeed();

  return (
    <>
      <Hero />
      <FeedGrid items={feed} />
      <SocialPresence />
    </>
  );
}
