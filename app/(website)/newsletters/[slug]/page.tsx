import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { getNewsletterBySlug } from "@/lib/data";
import { NewsletterInput } from "@/components/home/newsletter-input";
import { AdminEditShortcut } from "@/components/admin/AdminEditShortcut";
import { createClient } from "@/utils/supabase/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsletterPage({ params }: PageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);

  if (!newsletter) {
    notFound();
  }

  const isSent = newsletter.status === "sent";
  if (!isSent) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) notFound();
    const isAdmin =
      (user.app_metadata as { role?: string } | undefined)?.role === "admin" ||
      (user.user_metadata as { role?: string } | undefined)?.role === "admin";
    if (!isAdmin) notFound();
  }

  const isDraftPreview = !isSent;
  const date = newsletter.sent_at ?? newsletter.updated_at ?? newsletter.created_at;

  return (
    <>
    <AdminEditShortcut url={`/admin/newsletters/${newsletter.id}`} />
    <article className={`mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 ${isDraftPreview ? "pb-16" : ""}`}>
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-hot-white md:text-5xl">
          {newsletter.subject ?? "Newsletter"}
        </h1>
        {date && (
          <p className="mt-3 font-sans text-sm text-gray-400">
            Sent on {format(new Date(date), "MMMM d, yyyy")}
          </p>
        )}
      </header>

      {newsletter.featured_image && (
        <div className="relative mb-8 h-[280px] w-full overflow-hidden rounded-xl sm:h-[360px] md:h-[500px]">
          <Image
            src={newsletter.featured_image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      <div
        className="email-content prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: newsletter.content ?? "" }}
      />

      <section className="mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="font-serif text-lg font-semibold text-hot-white">
          Stay in the loop
        </h2>
        <p className="mt-2 font-sans text-sm text-gray-400">
          Get the next edition in your inbox.
        </p>
        <div className="mt-4">
          <NewsletterInput />
        </div>
      </section>
    </article>
    {isDraftPreview && (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-400 p-2 text-center font-sans font-bold text-black">
        PREVIEW MODE: DRAFT
      </div>
    )}
    </>
  );
}
