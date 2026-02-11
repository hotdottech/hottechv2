import Link from "next/link";
import { getCategories } from "@/lib/actions/categories";
import { getTags } from "@/lib/actions/tags";
import { getContentTypes } from "@/lib/actions/content-types";
import { EditPostForm } from "../edit-post-form";

export default async function NewPostPage() {
  const [categories, tags, contentTypes] = await Promise.all([
    getCategories(),
    getTags(),
    getContentTypes(),
  ]);

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/posts"
          className="font-sans text-sm text-gray-400 hover:text-hot-white"
        >
          ← All Posts
        </Link>
      </div>
      <h1 className="font-serif text-2xl font-bold text-hot-white">
        Add New Post
      </h1>
      <EditPostForm
        post={null}
        categories={categories}
        tags={tags}
        contentTypes={contentTypes}
        initialCategoryIds={[]}
        initialTagIds={[]}
        initialContentTypeId={null}
      />
    </div>
  );
}
