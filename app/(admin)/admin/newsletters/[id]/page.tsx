import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { getNewsletter } from "@/lib/data";
import { NewsletterRenderer } from "@/components/newsletter/newsletter-renderer";
import { getStats } from "../actions";
import { NewsletterWarRoom } from "../newsletter-war-room";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminNewsletterDetailPage({ params }: PageProps) {
  const { id: slug } = await params;
  const [newsletter, stats] = await Promise.all([
    getNewsletter(slug),
    getStats(),
  ]);

  if (!newsletter) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:gap-8 lg:p-10">
      {/* Left: Email preview (2/3) */}
      <div className="min-w-0 flex-1 lg:max-w-[66.666%]">
        <div className="rounded-lg border border-white/10 bg-white shadow-lg">
          <div className="max-w-xl mx-auto border-b border-gray-200 px-4 py-2 text-center text-sm text-gray-500">
            Email preview
          </div>
          <div className="mx-auto max-w-xl bg-white px-6 py-8 text-black [&_.text-hot-white]:!text-black [&_.text-gray-400]:!text-gray-600">
            <header className="mb-8">
              <h1 className="font-serif text-2xl font-bold text-black">
                {newsletter.subject ?? "Newsletter"}
              </h1>
              {newsletter.publishedAt && (
                <p className="mt-2 font-sans text-sm text-gray-600">
                  {format(new Date(newsletter.publishedAt), "MMMM d, yyyy")}
                </p>
              )}
            </header>
            <div className="prose prose-neutral max-w-none [&_.newsletter-block]:text-gray-800">
              <NewsletterRenderer body={newsletter.body} />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Controls (1/3) */}
      <aside className="w-full shrink-0 space-y-4 lg:w-[33.333%]">
        <NewsletterWarRoom
          slug={slug}
          documentId={newsletter._id}
          subscriberCount={stats.count}
        />
      </aside>
    </div>
  );
}
