import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByTaxonomy, getTaxonomyBySlug } from "@/lib/data";
import { constructMetadata } from "@/lib/seo";
import { ArchiveLayout } from "@/components/archive/ArchiveLayout";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tax = await getTaxonomyBySlug("content_type", slug);
  if (!tax) return {};
  return await constructMetadata({
    title: `${tax.name}s`,
    description: `All our latest ${tax.name}s.`,
    templateType: "archive",
  });
}

export default async function ContentTypeArchivePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPostsByTaxonomy("content_type", slug);

  if (!result) notFound();

  return (
    <ArchiveLayout
      title={result.title}
      description={result.description}
      posts={result.posts}
    />
  );
}
