import { getNavigationMenu } from "@/lib/actions/settings";
import { getCategories } from "@/lib/actions/categories";
import { MenuManager } from "./menu-manager";

export default async function AdminMenusPage() {
  const [initialItems, categories] = await Promise.all([
    getNavigationMenu(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <h1 className="font-serif text-2xl font-bold text-hot-white">
        Menu Manager
      </h1>
      <MenuManager initialItems={initialItems} categories={categories} />
    </div>
  );
}
