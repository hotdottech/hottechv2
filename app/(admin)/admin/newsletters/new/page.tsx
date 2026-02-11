import { NewsletterForm } from "@/components/admin/newsletters/NewsletterForm";

export default function NewNewsletterPage() {
  return (
    <div className="p-6 lg:p-10">
      <h1 className="mb-6 font-serif text-2xl font-bold text-hot-white">
        New Newsletter
      </h1>
      <NewsletterForm />
    </div>
  );
}
