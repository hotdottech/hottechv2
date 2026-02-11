"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";

type NavItem = { label: string; url: string };

const DEFAULT_NAV: NavItem[] = [{ label: "Home", url: "/" }];

function getNavItems(settings: SiteSettings | null): NavItem[] {
  const raw = settings?.navigation_menu;
  if (!raw || !Array.isArray(raw) || raw.length === 0) return DEFAULT_NAV;
  return raw.filter(
    (item): item is NavItem =>
      item != null &&
      typeof item === "object" &&
      typeof (item as NavItem).label === "string" &&
      typeof (item as NavItem).url === "string"
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const siteName = settings?.site_name ?? "Hot Tech";
  const showLogo = Boolean(settings?.show_logo && settings?.logo_url);
  const logoUrl = settings?.logo_url ?? null;
  const cta = settings?.cta_settings;
  const ctaLabel = cta?.label ?? "Subscribe";
  const ctaType = cta?.type ?? "subscribe";
  const ctaUrl = cta?.url ?? "";
  const navItems = getNavItems(settings);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full",
        "border-b border-white/10 backdrop-blur-md bg-hot-black/80"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo or site name (link to home) */}
        <Link href="/" className="flex items-center shrink-0">
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
        </Link>

        {/* Center: Desktop nav links */}
        <div className="hidden flex-1 justify-center gap-8 sm:flex">
          {navItems.map((item) => (
            <Link
              key={`${item.label}-${item.url}`}
              href={item.url}
              className="font-sans text-sm font-medium text-gray-300 transition-colors hover:text-hot-white"
              target={item.url.startsWith("http") ? "_blank" : undefined}
              rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

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
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {ctaLabel}
            </button>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-2",
              "text-hot-white hover:bg-white/10 transition-colors",
              "sm:hidden"
            )}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-hot-black/95 px-4 py-4 sm:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={`${item.label}-${item.url}`}>
                <Link
                  href={item.url}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 font-sans text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-hot-white"
                  target={item.url.startsWith("http") ? "_blank" : undefined}
                  rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
