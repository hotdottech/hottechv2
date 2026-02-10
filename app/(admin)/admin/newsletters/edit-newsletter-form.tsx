"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { updateNewsletter, type NewsletterRow } from "./actions";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function EditNewsletterForm({ newsletter }: { newsletter: NewsletterRow }) {
  const router = useRouter();
  const [subject, setSubject] = useState(newsletter.subject ?? "");
  const [slug, setSlug] = useState(newsletter.slug ?? "");
  const [previewText, setPreviewText] = useState(newsletter.preview_text ?? "");
  const [content, setContent] = useState(newsletter.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    setSaving(true);
    const formData = new FormData();
    formData.set("subject", subject);
    formData.set("slug", slug);
    formData.set("preview_text", previewText);
    formData.set("content", content);
    formData.set("status", newsletter.status ?? "draft");
    const result = await updateNewsletter(newsletter.id, formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/newsletters");
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div>
        <label className="block font-sans text-sm font-medium text-gray-400">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Newsletter subject line"
          className="mt-2 w-full rounded-md border border-white/10 bg-hot-gray px-4 py-3 font-serif text-xl text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
        />
      </div>

      <div>
        <label className="block font-sans text-sm font-medium text-gray-400">
          Content
        </label>
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Write your newsletter…"
          className="mt-2"
        />
      </div>

      <div className="flex flex-wrap gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="min-w-0 flex-1">
          <label className="block font-sans text-xs font-medium text-gray-500">
            Preview text
          </label>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Preheader"
            className="mt-1 w-full rounded border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug"
            className="w-32 rounded border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white"
          />
          <button
            type="button"
            onClick={() => setSlug(slugify(subject))}
            className="rounded border border-white/20 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
          >
            Generate
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black hover:bg-hot-white/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Draft"}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
