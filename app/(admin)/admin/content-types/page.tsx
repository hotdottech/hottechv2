import { getContentTypes } from "@/lib/actions/content-types";
import { ContentTypesManager } from "./content-types-manager";

export default async function AdminContentTypesPage() {
  const contentTypes = await getContentTypes();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <h1 className="font-serif text-2xl font-bold text-hot-white">
        Content Types
      </h1>
      <ContentTypesManager contentTypes={contentTypes} />
    </div>
  );
}
