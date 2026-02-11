import { notFound } from "next/navigation";
import { getNewsletterById } from "../actions";
import { NewsletterForm } from "@/components/admin/newsletters/NewsletterForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminNewsletterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const newsletter = await getNewsletterById(id);

  if (!newsletter) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="mb-6 font-serif text-2xl font-bold text-hot-white">
        Edit Newsletter
      </h1>
      <NewsletterForm initialData={newsletter} />
    </div>
  );
}
