import Link from "next/link";
import { getNewsletters } from "@/lib/data";
import { NewsletterTable } from "./newsletter-table";

const CREATE_INTENT_URL = "/admin/content/intent/create/template=newsletter;type=newsletter";

export default async function AdminNewslettersListPage() {
  const newsletters = await getNewsletters();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-hot-white">
          Campaigns
        </h1>
        <Link
          href={CREATE_INTENT_URL}
          className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
        >
          Create New
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full border-collapse font-sans">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            <NewsletterTable newsletters={newsletters} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
