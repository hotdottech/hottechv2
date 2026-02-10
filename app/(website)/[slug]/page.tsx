import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getPost } from "@/lib/data";
import { CustomPortableText } from "@/components/feed/portable-text";
import { urlFor } from "@/lib/sanity";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage as Parameters<typeof urlFor>[0]).width(1200).url()
    : null;
  const authorName = post.author?.name ?? "Hot Tech";
  const authorImage = post.author?.image;

  return (
    <article className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {/* Back to Home */}
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
          {authorImage && (
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-hot-gray">
              <Image
                src={urlFor(authorImage as Parameters<typeof urlFor>[0]).width(80).height(80).url()}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
              />
            </span>
          )}
          <span className="font-sans text-sm text-hot-white/90">
            {authorName}
          </span>
          {post.publishedAt && (
            <span className="font-sans text-sm">
              {format(new Date(post.publishedAt), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </header>

      {imageUrl && (
        <div className="relative my-12 aspect-video w-full overflow-hidden rounded-xl bg-hot-gray">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <CustomPortableText value={post.body} />
      </div>
    </article>
  );
}
