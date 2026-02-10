"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "./actions";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/content", label: "Content Studio" },
  { href: "/admin/newsletters", label: "Newsletters" },
  { href: "/admin/subscribers", label: "Subscribers" },
] as const;

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-white/10 bg-hot-gray">
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <Link
          href="/admin"
          className="font-serif text-lg font-semibold text-hot-white"
        >
          Hot Tech Admin
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 font-sans text-sm transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-white/10 text-hot-white"
                : "text-gray-400 hover:bg-white/5 hover:text-hot-white"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <p className="truncate px-3 py-1 font-sans text-xs text-gray-400">
          {userEmail}
        </p>
        <form action={signOut} className="mt-2">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left font-sans text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-hot-white"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
