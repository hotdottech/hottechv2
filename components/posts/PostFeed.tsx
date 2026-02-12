"use client";

import { useState } from "react";
import { FeedGrid } from "@/components/home/feed-grid";
import { getMorePosts } from "@/app/actions/posts";
import type { FeedItem } from "@/lib/types";

const PAGE_SIZE = 20;

export function PostFeed({ initialPosts }: { initialPosts: FeedItem[] }) {
  const [posts, setPosts] = useState<FeedItem[]>(initialPosts);
  const [offset, setOffset] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = await getMorePosts(offset, PAGE_SIZE);
      setPosts((prev) => [...prev, ...next]);
      setOffset((prev) => prev + next.length);
      if (next.length < PAGE_SIZE) setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FeedGrid items={posts} />
      {hasMore && (
        <div className="mx-auto max-w-7xl px-4 pb-16 text-center sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-md bg-hot-white px-6 py-2.5 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90 disabled:opacity-50"
          >
            {loading ? "Loading…" : "View More"}
          </button>
        </div>
      )}
    </>
  );
}
