import Link from "next/link";
import { format } from "date-fns";
import { getPosts } from "./actions";
import { PostsTable } from "./posts-table";

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-hot-white">
          All Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
        >
          Add New
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full border-collapse font-sans">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <PostsTable posts={posts} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
