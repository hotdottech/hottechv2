"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArticleCard } from "@/components/feed/article-card";
import { VideoCard } from "@/components/feed/video-card";
import type { FeedItem } from "@/lib/types";

type FeedGridProps = {
  items: FeedItem[];
  sectionTitle?: string;
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

export function FeedGrid({ items, sectionTitle }: FeedGridProps) {
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
      initial="hidden"
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
    </section>
  );
}
