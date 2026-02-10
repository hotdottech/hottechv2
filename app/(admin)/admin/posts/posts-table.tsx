"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { PostRow } from "./actions";
import { deletePost } from "./actions";

export function PostsTable({ posts }: { posts: PostRow[] }) {
  async function handleDelete(id: string) {
    if (!window.confirm("Delete this post?")) return;
    await deletePost(id);
    window.location.reload();
  }

  if (posts.length === 0) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
          No posts yet.{" "}
          <Link href="/admin/posts/new" className="text-hot-white hover:underline">
            Add one
          </Link>
          .
        </td>
      </tr>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <tr
          key={post.id}
          className="border-b border-white/5 transition-colors hover:bg-white/5"
        >
          <td className="px-4 py-3">
            <Link
              href={`/admin/posts/${post.id}`}
              className="font-medium text-hot-white hover:underline"
            >
              {post.title || "Untitled"}
            </Link>
          </td>
          <td className="px-4 py-3">
            <span
              className={
                post.status === "published"
                  ? "rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400"
                  : "rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400"
              }
            >
              {post.status === "published" ? "Published" : "Draft"}
            </span>
          </td>
          <td className="px-4 py-3 text-gray-400">
            {post.created_at
              ? format(new Date(post.created_at), "MMM d, yyyy")
              : "—"}
          </td>
          <td className="px-4 py-3 text-right">
            <Link
              href={`/admin/posts/${post.id}`}
              className="mr-3 text-sm text-hot-white/80 hover:text-hot-white"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(post.id)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
