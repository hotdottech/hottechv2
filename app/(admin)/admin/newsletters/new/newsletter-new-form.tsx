"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { AudienceSelector } from "@/components/admin/newsletters/AudienceSelector";
import { createNewsletter } from "../actions";
import type { TargetConfig } from "@/lib/actions/newsletter-audience";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function NewsletterNewForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [slug, setSlug] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [content, setContent] = useState("");
  const [targetConfig, setTargetConfig] = useState<TargetConfig>({
    type: "all",
    filters: { sources: [], tags: [] },
    manual_ids: [],
  });
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
    formData.set("status", "draft");
    formData.set("target_config", JSON.stringify(targetConfig));
    const result = await createNewsletter(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.id) router.push("/admin/newsletters");
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="min-w-0 flex-1 space-y-6 lg:max-w-[66.666%]">
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
          <AudienceSelector value={targetConfig} onChange={setTargetConfig} />
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
      </div>

      <aside className="w-full shrink-0 space-y-4 lg:w-[33.333%]">
        {error && (
          <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-sans text-sm font-medium text-hot-white">
            Preview text
          </h3>
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Preheader / preview text"
            rows={3}
            className="mt-3 w-full resize-y rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-sans text-sm font-medium text-hot-white">
            Slug
          </h3>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              className="flex-1 rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSlug(slugify(subject))}
              className="shrink-0 rounded-md border border-white/20 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-md bg-hot-white py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
        </div>
      </aside>
    </div>
  );
}
