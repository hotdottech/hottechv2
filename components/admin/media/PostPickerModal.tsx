"use client";

import { useCallback, useEffect, useState } from "react";
import { searchPosts, type PostPickerPost } from "@/lib/actions/post-picker";
import { format } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (post: PostPickerPost) => void;
};

export function PostPickerModal({ isOpen, onClose, onSelect }: Props) {
  const [posts, setPosts] = useState<PostPickerPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPosts = useCallback(async (query: string) => {
    setLoading(true);
    const data = await searchPosts(query || undefined);
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchPosts("");
  }, [isOpen, fetchPosts]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => fetchPosts(search), 200);
    return () => clearTimeout(t);
  }, [isOpen, search, fetchPosts]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-picker-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border border-white/10 bg-hot-black shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="post-picker-title" className="font-serif text-xl font-semibold text-hot-white">
            Embed post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-white/10 hover:text-hot-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="shrink-0 border-b border-white/10 px-6 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title (e.g. Samsung)"
            className="w-full rounded-md border border-white/20 bg-black px-4 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">No published posts found.</p>
          ) : (
            <ul className="space-y-2">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-white/10">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans font-medium text-hot-white truncate">
                      {post.title}
                    </p>
                    <p className="font-sans text-xs text-gray-500">
                      {post.published_at
                        ? format(new Date(post.published_at), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(post);
                      onClose();
                    }}
                    className="shrink-0 rounded-md bg-hot-white px-3 py-1.5 font-sans text-sm font-medium text-hot-black hover:bg-hot-white/90"
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
