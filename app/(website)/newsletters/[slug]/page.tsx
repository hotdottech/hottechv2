import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getNewsletter } from "@/lib/data";
import { NewsletterRenderer } from "@/components/newsletter/newsletter-renderer";
import { NewsletterInput } from "@/components/home/newsletter-input";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsletterPage({ params }: PageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletter(slug);

  if (!newsletter) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-hot-white md:text-5xl">
          {newsletter.subject ?? "Newsletter"}
        </h1>
        {newsletter.publishedAt && (
          <p className="mt-3 font-sans text-sm text-gray-400">
            {format(new Date(newsletter.publishedAt), "MMMM d, yyyy")}
          </p>
        )}
      </header>

      <div className="prose prose-invert max-w-none">
        <NewsletterRenderer body={newsletter.body} />
      </div>

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
  );
}
