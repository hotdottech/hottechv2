import { getTags } from "@/lib/actions/tags";
import { TagsManager } from "./tags-manager";

export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <h1 className="font-serif text-2xl font-bold text-hot-white">
        Tags
      </h1>
      <TagsManager tags={tags} />
    </div>
  );
}
