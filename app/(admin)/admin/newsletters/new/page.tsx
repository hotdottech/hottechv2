import Link from "next/link";
import { NewsletterNewForm } from "./newsletter-new-form";

export default function NewNewsletterPage() {
  return (
    <div className="space-y-6 p-6 lg:p-10">
      <Link
        href="/admin/newsletters"
        className="font-sans text-sm text-gray-400 hover:text-hot-white"
      >
        ← Campaigns
      </Link>
      <h1 className="font-serif text-2xl font-bold text-hot-white">
        New Newsletter
      </h1>
      <NewsletterNewForm />
    </div>
  );
}
