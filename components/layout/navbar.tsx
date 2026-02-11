"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";

const ctaButtonClass = cn(
  "hidden rounded-full px-5 py-2.5 text-sm font-medium",
  "bg-hot-white text-hot-black",
  "transition-colors duration-200",
  "hover:bg-hot-red hover:text-white",
  "sm:inline-block"
);

type NavbarProps = {
  settings: SiteSettings | null;
};

export function Navbar({ settings }: NavbarProps) {
  const siteName = settings?.site_name ?? "Hot Tech";
  const showLogo = Boolean(settings?.show_logo && settings?.logo_url);
  const logoUrl = settings?.logo_url ?? null;
  const cta = settings?.cta_settings;
  const ctaLabel = cta?.label ?? "Subscribe";
  const ctaType = cta?.type ?? "subscribe";
  const ctaUrl = cta?.url ?? "";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full",
        "border-b border-white/10 backdrop-blur-md bg-hot-black/80"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo or site name */}
        {showLogo && logoUrl ? (
          <Image
            src={logoUrl}
            alt={siteName}
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span className="font-serif text-xl font-bold text-hot-white">
            {siteName}
          </span>
        )}

        {/* Right: CTA (desktop) / Menu (mobile) */}
        <div className="flex items-center gap-3">
          {ctaType === "custom" && ctaUrl ? (
            <Link
              href={ctaUrl}
              className={ctaButtonClass}
              target={ctaUrl.startsWith("http") ? "_blank" : undefined}
              rel={ctaUrl.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              className={ctaButtonClass}
              onClick={() => {
                if (ctaType === "subscribe") {
                  document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth" });
                } else if (ctaType === "contact") {
                  // Placeholder: Contact Modal (to be implemented)
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {ctaLabel}
            </button>
          )}
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
