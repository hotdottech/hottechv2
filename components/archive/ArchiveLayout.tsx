import { FeedGrid } from "@/components/home/feed-grid";
import type { FeedItem } from "@/lib/types";

type ArchiveLayoutProps = {
  title: string;
  description?: string;
  posts: FeedItem[];
};

export function ArchiveLayout({
  title,
  description,
  posts,
}: ArchiveLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12 text-center md:text-left">
        <h1 className="font-serif text-4xl font-bold text-hot-white md:text-5xl">
          {title}
        </h1>
        {description?.trim() && (
          <p className="mt-3 font-sans text-lg text-gray-400">
            {description.trim()}
          </p>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="font-sans text-gray-400">
          No posts found in this category.
        </p>
      ) : (
        <FeedGrid items={posts} />
      )}
    </div>
  );
}
