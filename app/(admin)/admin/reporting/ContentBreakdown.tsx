"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TopPostRow, TopNewsletterRow } from "@/lib/analytics";

export function ContentBreakdown({
  posts,
  newsletters,
}: {
  posts: TopPostRow[];
  newsletters: TopNewsletterRow[];
}) {
  const [tab, setTab] = useState<"posts" | "newsletters">("posts");

  return (
    <div className="mt-10">
      <h2 className="font-serif text-xl font-semibold text-hot-white">
        Content Breakdown
      </h2>
      <div className="mt-3 flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={cn(
            "rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors",
            tab === "posts"
              ? "bg-white/10 text-hot-white"
              : "text-gray-400 hover:text-hot-white"
          )}
        >
          Posts
        </button>
        <button
          type="button"
          onClick={() => setTab("newsletters")}
          className={cn(
            "rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors",
            tab === "newsletters"
              ? "bg-white/10 text-hot-white"
              : "text-gray-400 hover:text-hot-white"
          )}
        >
          Newsletters
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
        {tab === "posts" && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-gray-400">
                  Title
                </th>
                <th className="px-4 py-3 text-right font-sans text-xs font-medium uppercase tracking-wider text-gray-400">
                  Unique Visitors
                </th>
                <th className="px-4 py-3 text-right font-sans text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Views
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center font-sans text-sm text-gray-400"
                  >
                    No post analytics yet.
                  </td>
                </tr>
              ) : (
                posts.map((row) => (
                  <tr
                    key={row.post_id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={row.slug ? `/${row.slug}` : `/admin/posts/${row.post_id}`}
                        className="font-medium text-hot-white hover:underline"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-sans text-sm text-gray-300">
                      {row.unique_visitors.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-sans text-sm text-gray-300">
                      {row.total_views.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === "newsletters" && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-gray-400">
                  Subject
                </th>
                <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-gray-400">
                  Sent Date
                </th>
                <th className="px-4 py-3 text-right font-sans text-xs font-medium uppercase tracking-wider text-gray-400">
                  Unique Opens
                </th>
                <th className="px-4 py-3 text-right font-sans text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Opens
                </th>
              </tr>
            </thead>
            <tbody>
              {newsletters.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center font-sans text-sm text-gray-400"
                  >
                    No newsletter opens yet.
                  </td>
                </tr>
              ) : (
                newsletters.map((row) => (
                  <tr
                    key={row.newsletter_id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-medium text-hot-white">
                      {row.subject}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-gray-400">
                      {row.sent_at
                        ? format(new Date(row.sent_at), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-sans text-sm text-gray-300">
                      {row.unique_opens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-sans text-sm text-gray-300">
                      {row.total_opens.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
