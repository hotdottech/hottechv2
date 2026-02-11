import { notFound } from "next/navigation";
import { getPostsByTaxonomy } from "@/lib/data";
import { ArchiveLayout } from "@/components/archive/ArchiveLayout";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
