"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryRow,
} from "@/lib/actions/categories";

function buildTreeRows(categories: CategoryRow[]): { category: CategoryRow; depth: number }[] {
  const byParent = new Map<number | null, CategoryRow[]>();
  for (const c of categories) {
    const key = c.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  const result: { category: CategoryRow; depth: number }[] = [];
  function visit(parentId: number | null, depth: number) {
    const list = byParent.get(parentId) ?? [];
    list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    for (const c of list) {
      result.push({ category: c, depth });
      visit(c.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
}

type Props = {
  categories: CategoryRow[];
};

export function CategoriesManager({ categories }: Props) {
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);

  const [state, formAction] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const id = formData.get("id");
      if (id != null && String(id).trim() !== "") {
        return await updateCategory(formData);
      }
      return await createCategory(formData);
    },
    null
  );

  useEffect(() => {
    if (state && !state.error) {
      setEditingCategory(null);
      router.refresh();
    }
  }, [state, router]);

  const treeRows = buildTreeRows(categories);
  const parentOptions = categories.filter((c) => c.id !== editingCategory?.id);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 font-sans text-lg font-medium text-hot-white">
          {editingCategory ? "Edit Category" : "Add New Category"}
        </h2>
        <form action={formAction} className="space-y-4">
          {editingCategory && (
            <input type="hidden" name="id" value={editingCategory.id} readOnly />
          )}
          {state?.error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}
          <div>
            <label className="mb-1 block font-sans text-sm text-gray-400">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={editingCategory?.name ?? ""}
              key={editingCategory?.id ?? "new"}
              placeholder="e.g. Reviews"
              className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-sm text-gray-400">
              Slug <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={editingCategory?.slug ?? ""}
              key={editingCategory?.id ?? "new"}
              placeholder="Auto-generated from name if empty"
              className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-sm text-gray-400">
              Parent Category
            </label>
            <select
              name="parent_id"
              defaultValue={editingCategory?.parent_id ?? ""}
              key={editingCategory?.id ?? "new"}
              className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white focus:border-hot-white/30 focus:outline-none"
            >
              <option value="">None (root)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
            >
              {editingCategory ? "Update" : "Add Category"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 font-sans text-lg font-medium text-hot-white">
          Existing Categories
        </h2>
        <div className="overflow-hidden rounded-md border border-white/10">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Slug
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Count
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {treeRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No categories yet. Add one to the left.
                  </td>
                </tr>
              ) : (
                treeRows.map(({ category: cat, depth }) => (
                  <tr
                    key={cat.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td
                      className="px-4 py-3 text-hot-white"
                      style={{ paddingLeft: `${16 + depth * 20}px` }}
                    >
                      {depth > 0 && (
                        <span className="mr-2 text-gray-500">↳</span>
                      )}
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{cat.slug}</td>
                    <td className="px-4 py-3 text-gray-400">0</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(cat)}
                          className="rounded-md border border-white/20 px-3 py-1.5 font-sans text-sm text-hot-white hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <form action={deleteCategory.bind(null, cat.id)} className="inline">
                          <button
                            type="submit"
                            className="rounded-md border border-red-500/50 px-3 py-1.5 font-sans text-sm text-red-400 transition-colors hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
