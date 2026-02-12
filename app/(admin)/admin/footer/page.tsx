import Link from "next/link";
import { getFooterSettings } from "@/lib/actions/settings";
import { FooterEditor } from "./footer-editor";

export default async function AdminFooterPage() {
  const initialConfig = await getFooterSettings();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="font-sans text-sm text-gray-400 hover:text-hot-white"
        >
          ← Dashboard
        </Link>
      </div>
      <h1 className="font-serif text-2xl font-bold text-hot-white">
        Footer Editor
      </h1>
      <p className="font-sans text-sm text-gray-400">
        Configure the 3-column footer. Add blocks to each column, then click Save
        to update the live site.
      </p>
      <FooterEditor initialConfig={initialConfig} />
    </div>
  );
}
