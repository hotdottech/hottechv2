import Link from "next/link";
import { PostForm } from "./post-form";

export default function NewPostPage() {
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
      <PostForm />
    </div>
  );
}
