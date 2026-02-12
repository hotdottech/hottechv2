"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArticleCard } from "@/components/feed/article-card";
import { VideoCard } from "@/components/feed/video-card";
import type { FeedItem } from "@/lib/types";

type FeedGridProps = {
  items: FeedItem[];
  sectionTitle?: string;
  /** When false, items are visible immediately (avoids ghost cards when appending "Load More"). */
  useStaggerAnimation?: boolean;
  /** Optional "View All" style button below the grid. Rendered when both are set. */
  buttonText?: string;
  buttonLink?: string;
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function FeedGrid({
  items,
  sectionTitle,
  useStaggerAnimation = true,
  buttonText,
  buttonLink,
}: FeedGridProps) {
  const showButton =
    buttonText?.trim() && buttonLink?.trim();

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      {sectionTitle?.trim() && (
        <h2 className="mb-6 font-serif text-2xl font-bold text-hot-white">
          {sectionTitle.trim()}
        </h2>
      )}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial={useStaggerAnimation ? "hidden" : "visible"}
        animate="visible"
        layout
      >
        <AnimatePresence mode="popLayout">
          {items.map((feedItem) => (
            <motion.div
              key={feedItem.id}
              layout
              variants={itemVariants}
              transition={{ layout: { duration: 0.3 } }}
            >
              {feedItem.type === "video" ? (
                <VideoCard item={feedItem} />
              ) : (
                <ArticleCard item={feedItem} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {showButton && (
        <div className="mt-8 flex justify-center">
          <a
            href={buttonLink!.trim()}
            className="rounded-md bg-hot-white px-6 py-3 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
          >
            {buttonText!.trim()}
          </a>
        </div>
      )}
    </section>
  );
}
