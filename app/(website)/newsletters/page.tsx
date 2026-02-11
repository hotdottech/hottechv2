import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { getSentNewsletters } from "@/lib/data";

export default async function NewsletterArchivePage() {
  const newsletters = await getSentNewsletters();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h1 className="font-serif text-4xl font-bold text-hot-white md:text-5xl">
          Newsletter Archive
        </h1>
        <p className="mt-3 font-sans text-lg text-gray-400">
          Past issues of House of Tech
        </p>
      </header>

      {newsletters.length === 0 ? (
        <p className="font-sans text-gray-500">
          No issues yet. Check back soon.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {newsletters.map((n) => (
            <li key={n.id}>
              <Link
                href={n.slug ? `/newsletters/${n.slug}` : "#"}
                className="block overflow-hidden rounded-xl border border-white/10 bg-hot-black/40 transition-colors hover:border-white/20 hover:bg-hot-black/60"
              >
                {n.featured_image ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={n.featured_image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                <p className="font-sans text-sm text-gray-500">
                  {n.sent_at ? format(new Date(n.sent_at), "MMM d, yyyy") : "—"}
                </p>
                <h2 className="mt-2 font-serif text-xl font-semibold text-hot-white md:text-2xl">
                  {n.subject ?? "Untitled"}
                </h2>
                {(n.preview_text ?? n.description) && (
                  <p className="mt-2 line-clamp-2 font-sans text-sm text-gray-400">
                    {n.preview_text ?? n.description}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-hot-white">
                  Read Issue
                  <ArrowRight className="h-4 w-4" />
                </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
