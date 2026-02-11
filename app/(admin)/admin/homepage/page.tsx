import Link from "next/link";
import { getHomepageLayout } from "@/lib/actions/settings";
import { HomepageBuilder } from "./homepage-builder";

export default async function AdminHomepagePage() {
  const layout = await getHomepageLayout();

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
        Homepage Builder
      </h1>
      <HomepageBuilder initialLayout={layout} />
    </div>
  );
}
