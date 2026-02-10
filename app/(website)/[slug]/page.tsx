import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const date = post.updated_at ?? post.created_at;

  return (
    <article className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 font-sans text-sm text-gray-400 transition-colors hover:text-hot-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <header className="mb-6">
        <h1 className="font-serif text-5xl font-bold text-hot-white mb-6 md:text-6xl">
          {post.title ?? "Untitled"}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-gray-400">
          <span className="font-sans text-sm text-hot-white/90">Hot Tech</span>
          {date && (
            <span className="font-sans text-sm">
              {format(new Date(date), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </header>

      {post.featured_image && (
        <div className="relative my-12 aspect-video w-full overflow-hidden rounded-xl bg-hot-gray">
          <Image
            src={post.featured_image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      <div
        className="prose prose-lg prose-invert mx-auto max-w-2xl max-w-none"
        dangerouslySetInnerHTML={{
          __html: (post as { content?: string; body?: string }).content || post.body || "",
        }}
      />
    </article>
  );
}
