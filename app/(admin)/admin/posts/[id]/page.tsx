import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById } from "../actions";
import { EditPostForm } from "../edit-post-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

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
        Edit Post
      </h1>
      <EditPostForm post={post} />
    </div>
  );
}
