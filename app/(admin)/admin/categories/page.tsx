import { getCategories } from "@/lib/actions/categories";
import { CategoriesManager } from "./categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <h1 className="font-serif text-2xl font-bold text-hot-white">
        Categories
      </h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
