"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArticleCard } from "@/components/feed/article-card";
import { VideoCard } from "@/components/feed/video-card";
import type { FeedItem } from "@/lib/types";

type FeedGridProps = {
  items: FeedItem[];
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

export function FeedGrid({ items }: FeedGridProps) {
  return (
    <motion.div
      className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8"
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
  );
}
