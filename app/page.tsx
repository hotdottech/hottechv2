import { getUnifiedFeed } from "@/lib/data";
import { Hero } from "@/components/home/hero";
import { FeedGrid } from "@/components/home/feed-grid";
import { SocialPresence } from "@/components/home/social-presence";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReactiveBackground } from "@/components/layout/reactive-background";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const feed = await getUnifiedFeed();

  return (
    <>
      <ReactiveBackground />
      <Navbar />
      <main className="min-h-screen pt-20">
        <Hero />
        <FeedGrid items={feed} />
        <SocialPresence />
      </main>
      <Footer />
    </>
  );
}
