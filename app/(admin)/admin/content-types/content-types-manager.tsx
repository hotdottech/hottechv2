"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createContentType,
  updateContentType,
  deleteContentType,
  type ContentTypeRow,
} from "@/lib/actions/content-types";

type Props = {
  contentTypes: ContentTypeRow[];
};

export function ContentTypesManager({ contentTypes }: Props) {
  const router = useRouter();
  const [editingType, setEditingType] = useState<ContentTypeRow | null>(null);

  const [state, formAction] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const id = formData.get("id");
      if (id != null && String(id).trim() !== "") {
        return await updateContentType(formData);
      }
      return await createContentType(formData);
    },
    null
  );

  useEffect(() => {
    if (state && !state.error) {
      setEditingType(null);
      router.refresh();
    }
  }, [state, router]);

  async function handleDelete(type: ContentTypeRow) {
    if (!confirm(`Delete content type "${type.name}"? This cannot be undone.`))
      return;
    const result = await deleteContentType(type.id);
    if (!result.error) router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 font-sans text-lg font-medium text-hot-white">
          {editingType ? "Edit Content Type" : "Add New Content Type"}
        </h2>
        <form action={formAction} className="space-y-4">
          {editingType && (
            <input type="hidden" name="id" value={editingType.id} readOnly />
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
              defaultValue={editingType?.name ?? ""}
              key={editingType?.id ?? "new"}
              placeholder="e.g. Review, News, Analysis"
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
              defaultValue={editingType?.slug ?? ""}
              key={editingType?.id ?? "new"}
              placeholder="Auto-generated from name if empty"
              className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
            >
              {editingType ? "Update Content Type" : "Add New Content Type"}
            </button>
            {editingType && (
              <button
                type="button"
                onClick={() => setEditingType(null)}
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
          All Content Types
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
              {contentTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No content types yet. Add one to the left.
                  </td>
                </tr>
              ) : (
                contentTypes.map((type) => (
                  <tr
                    key={type.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-hot-white">{type.name}</td>
                    <td className="px-4 py-3 text-gray-400">{type.slug}</td>
                    <td className="px-4 py-3 text-gray-400">0</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingType(type)}
                          className="rounded-md border border-white/20 px-3 py-1.5 font-sans text-sm text-hot-white hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(type)}
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
