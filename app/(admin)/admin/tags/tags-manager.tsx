"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createTag,
  updateTag,
  deleteTag,
  type TagRow,
} from "@/lib/actions/tags";

type Props = {
  tags: TagRow[];
};

export function TagsManager({ tags }: Props) {
  const router = useRouter();
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);

  const [state, formAction] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const id = formData.get("id");
      if (id != null && String(id).trim() !== "") {
        return await updateTag(formData);
      }
      return await createTag(formData);
    },
    null
  );

  useEffect(() => {
    if (state && !state.error) {
      setEditingTag(null);
      router.refresh();
    }
  }, [state, router]);

  async function handleDelete(tag: TagRow) {
    if (!confirm(`Delete tag "${tag.name}"? This cannot be undone.`)) return;
    const result = await deleteTag(tag.id);
    if (!result.error) router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 font-sans text-lg font-medium text-hot-white">
          {editingTag ? "Edit Tag" : "Add New Tag"}
        </h2>
        <form action={formAction} className="space-y-4">
          {editingTag && (
            <input type="hidden" name="id" value={editingTag.id} readOnly />
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
              defaultValue={editingTag?.name ?? ""}
              key={editingTag?.id ?? "new"}
              placeholder="e.g. Android"
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
              defaultValue={editingTag?.slug ?? ""}
              key={editingTag?.id ?? "new"}
              placeholder="Auto-generated from name if empty"
              className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
            >
              {editingTag ? "Update Tag" : "Add New Tag"}
            </button>
            {editingTag && (
              <button
                type="button"
                onClick={() => setEditingTag(null)}
                className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex max-h-[calc(100vh-5rem)] min-h-0 flex-col rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 shrink-0 font-sans text-lg font-medium text-hot-white">
          All Tags
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-white/10">
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
              {tags.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No tags yet. Add one to the left.
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-hot-white">{tag.name}</td>
                    <td className="px-4 py-3 text-gray-400">{tag.slug}</td>
                    <td className="px-4 py-3 text-gray-400">0</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingTag(tag)}
                          className="rounded-md border border-white/20 px-3 py-1.5 font-sans text-sm text-hot-white hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tag)}
                          className="rounded-md border border-red-500/50 px-3 py-1.5 font-sans text-sm text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          Delete
                        </button>
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
