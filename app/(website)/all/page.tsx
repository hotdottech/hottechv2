import { getMorePosts } from "@/app/actions/posts";
import { PostFeed } from "@/components/posts/PostFeed";

export default async function AllPostsPage() {
  const initialPosts = await getMorePosts(0, 20);

  return (
    <div className="container mx-auto py-12">
      <h1 className="mb-8 font-serif text-4xl font-bold text-hot-white">
        All Posts
      </h1>
      <PostFeed initialPosts={initialPosts} />
    </div>
  );
}
