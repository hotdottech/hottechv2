import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsletterById, getStats } from "../actions";
import { EditNewsletterForm } from "../edit-newsletter-form";
import { NewsletterWarRoom } from "../newsletter-war-room";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminNewsletterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [newsletter, stats] = await Promise.all([
    getNewsletterById(id),
    getStats(),
  ]);

  if (!newsletter) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:gap-8 lg:p-10">
      <div className="min-w-0 flex-1 lg:max-w-[66.666%]">
        <Link
          href="/admin/newsletters"
          className="font-sans text-sm text-gray-400 hover:text-hot-white"
        >
          ← Campaigns
        </Link>
        <EditNewsletterForm newsletter={newsletter} />
      </div>

      <aside className="w-full shrink-0 space-y-4 lg:w-[33.333%]">
        <NewsletterWarRoom
          slug={newsletter.slug ?? newsletter.id}
          documentId={newsletter.id}
          subscriberCount={stats.count}
        />
      </aside>
    </div>
  );
}
