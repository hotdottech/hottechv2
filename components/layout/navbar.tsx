"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full",
        "border-b border-white/10 backdrop-blur-md bg-hot-black/80"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Wordmark */}
        <span className="font-serif text-xl font-bold text-hot-white">
          Hot Tech
        </span>

        {/* Right: Subscribe (desktop) / Menu (mobile) */}
        <div className="flex items-center gap-3">
          <a
            href="#subscribe"
            className={cn(
              "hidden rounded-full px-5 py-2.5 text-sm font-medium",
              "bg-hot-white text-hot-black",
              "transition-colors duration-200",
              "hover:bg-hot-red hover:text-white",
              "sm:inline-block"
            )}
          >
            Subscribe
          </a>
          <button
            type="button"
            aria-label="Open menu"
            className={cn(
              "inline-flex items-center justify-center rounded-md p-2",
              "text-hot-white hover:bg-white/10 transition-colors",
              "sm:hidden"
            )}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
