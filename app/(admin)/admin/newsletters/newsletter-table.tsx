"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { SanityNewsletterListItem } from "@/lib/data";

export function NewsletterTable({
  newsletters,
}: {
  newsletters: SanityNewsletterListItem[];
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
        const status = item.publishedAt == null ? "Draft" : "Sent";
        const href = item.slug ? `/admin/newsletters/${item.slug}` : null;
        return (
          <tr
            key={item._id}
            className={
              href
                ? "cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                : "border-b border-white/5"
            }
            onClick={href ? () => router.push(href) : undefined}
            role={href ? "button" : undefined}
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
              {href ? (
                <Link
                  href={href}
                  className="block font-medium hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.subject ?? "Untitled"}
                </Link>
              ) : (
                <span>{item.subject ?? "Untitled"}</span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-400">
              {item.publishedAt
                ? format(new Date(item.publishedAt), "MMM d, yyyy")
                : "—"}
            </td>
          </tr>
        );
      })}
    </>
  );
}
