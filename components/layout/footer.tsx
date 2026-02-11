"use client";

import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

const CURRENT_YEAR = new Date().getFullYear();

const legacyLinks = [
  { href: "/awards", label: "Awards" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-hot-gray bg-hot-black">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Left column */}
          <div className="text-hot-white">
            <span className="font-medium">Nirave Gondhia / Hot Tech</span>
          </div>

          {/* Right column: Newsletter + legacy links */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 font-sans text-sm font-medium text-hot-white">
                Stay updated
              </p>
              <NewsletterForm source="footer" variant="stack" />
            </div>
            <nav className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              {legacyLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-hot-white/80 transition-colors hover:text-hot-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <p className="mt-8 border-t border-hot-gray pt-8 text-center text-sm text-hot-white/60">
          © {CURRENT_YEAR} International House of Technology Ltd.
        </p>
      </div>
    </footer>
  );
}
