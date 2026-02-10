"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { NewsletterRow } from "./actions";

export function NewsletterTable({
  newsletters,
}: {
  newsletters: NewsletterRow[];
}) {
  const router = useRouter();

  if (newsletters.length === 0) {
    return (
      <tr>
        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
          No newsletters yet. Create one to get started.
        </td>
      </tr>
    );
  }

  return (
    <>
      {newsletters.map((item) => {
        const status = item.status === "sent" || item.published_at != null ? "Sent" : "Draft";
        const href = `/admin/newsletters/${item.id}`;
        const date = item.updated_at ?? item.created_at;
        return (
          <tr
            key={item.id}
            className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
            onClick={() => router.push(href)}
            role="button"
          >
            <td className="px-4 py-3">
              <span
                className={
                  status === "Draft"
                    ? "rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400"
                    : "rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400"
                }
              >
                {status}
              </span>
            </td>
            <td className="px-4 py-3 text-hot-white">
              <Link
                href={href}
                className="block font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {item.subject ?? "Untitled"}
              </Link>
            </td>
            <td className="px-4 py-3 text-gray-400">
              {date ? format(new Date(date), "MMM d, yyyy") : "—"}
            </td>
          </tr>
        );
      })}
    </>
  );
}
