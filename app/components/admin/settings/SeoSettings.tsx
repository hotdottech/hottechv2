"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { UniversalImagePicker } from "@/app/components/admin/shared/UniversalImagePicker";
import { updateSeoSettings } from "@/lib/actions/settings";

const DEFAULT_TITLE = "House of Tech";
const DEFAULT_DESCRIPTION = "Tech Reviews & News";
const DEFAULT_TEMPLATE_POST = "{{title}} | {{site_title}}";
const DEFAULT_TEMPLATE_ARCHIVE = "{{title}} Archives | {{site_title}}";
const DEFAULT_TEMPLATE_PAGE = "{{title}} | {{site_title}}";

type SeoRow = {
  seo_title: string | null;
  seo_description: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  default_og_image: string | null;
  seo_template_post: string | null;
  seo_template_archive: string | null;
  seo_template_page: string | null;
};

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function SeoSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [seoTitle, setSeoTitle] = useState(DEFAULT_TITLE);
  const [seoDescription, setSeoDescription] = useState(DEFAULT_DESCRIPTION);
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedIn, setSocialLinkedIn] = useState("");
  const [defaultOgImage, setDefaultOgImage] = useState<string | null>(null);
  const [templatePost, setTemplatePost] = useState(DEFAULT_TEMPLATE_POST);
  const [templateArchive, setTemplateArchive] = useState(DEFAULT_TEMPLATE_ARCHIVE);
  const [templatePage, setTemplatePage] = useState(DEFAULT_TEMPLATE_PAGE);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("seo_title, seo_description, social_twitter, social_linkedin, default_og_image, seo_template_post, seo_template_archive, seo_template_page")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data) {
      const row = data as SeoRow;
      setSeoTitle(row.seo_title?.trim() || DEFAULT_TITLE);
      setSeoDescription(row.seo_description?.trim() || DEFAULT_DESCRIPTION);
      setSocialTwitter(row.social_twitter?.trim() || "");
      setSocialLinkedIn(row.social_linkedin?.trim() || "");
      setDefaultOgImage(row.default_og_image?.trim() || null);
      setTemplatePost(row.seo_template_post?.trim() || DEFAULT_TEMPLATE_POST);
      setTemplateArchive(row.seo_template_archive?.trim() || DEFAULT_TEMPLATE_ARCHIVE);
      setTemplatePage(row.seo_template_page?.trim() || DEFAULT_TEMPLATE_PAGE);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await updateSeoSettings({
      seo_title: seoTitle || DEFAULT_TITLE,
      seo_description: seoDescription || DEFAULT_DESCRIPTION,
      social_twitter: socialTwitter.trim() || null,
      social_linkedin: socialLinkedIn.trim() || null,
      default_og_image: defaultOgImage?.trim() || null,
      seo_template_post: templatePost.trim() || null,
      seo_template_archive: templateArchive.trim() || null,
      seo_template_page: templatePage.trim() || null,
    });
    setSaving(false);
    if (result.error) {
      setMessage("Error: " + result.error);
    } else {
      setMessage("SEO settings saved.");
    }
  }, [seoTitle, seoDescription, socialTwitter, socialLinkedIn, defaultOgImage, templatePost, templateArchive, templatePage]);

  if (loading) {
    return (
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="font-sans text-lg font-semibold text-hot-white">SEO</h2>
        <p className="font-sans text-gray-400">Loading…</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-lg font-semibold text-hot-white">
          SEO
        </h2>
        {message && (
          <p
            className={
              message.startsWith("Error")
                ? "font-sans text-sm text-red-400"
                : "font-sans text-sm text-green-400"
            }
          >
            {message}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm text-gray-400">
          Site Title
        </label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          className="w-full max-w-md rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          placeholder={DEFAULT_TITLE}
        />
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm text-gray-400">
          Site Description
        </label>
        <textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          rows={3}
          className="w-full max-w-md rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          placeholder={DEFAULT_DESCRIPTION}
        />
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm text-gray-400">
          Twitter Handle
        </label>
        <input
          type="text"
          value={socialTwitter}
          onChange={(e) => setSocialTwitter(e.target.value)}
          className="w-full max-w-md rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          placeholder="@nirave"
        />
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm text-gray-400">
          LinkedIn URL
        </label>
        <input
          type="url"
          value={socialLinkedIn}
          onChange={(e) => setSocialLinkedIn(e.target.value)}
          className="w-full max-w-md rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          placeholder="https://linkedin.com/in/..."
        />
      </div>
      <div>
        <UniversalImagePicker
          value={defaultOgImage}
          onChange={(url) => setDefaultOgImage(url || null)}
          label="Default Social Image"
        />
      </div>

      <h3 className="font-sans text-base font-semibold text-hot-white pt-2 border-t border-white/10 mt-6">
        Title Formats
      </h3>
      <p className="font-sans text-sm text-gray-400">
        Use variables in curly braces. The browser tab title will follow the template for each content type.
      </p>
      <div>
        <label className="mb-1 block font-sans text-sm text-gray-400">
          Post title format
        </label>
        <input
          type="text"
          value={templatePost}
          onChange={(e) => setTemplatePost(e.target.value)}
          className="w-full max-w-md rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          placeholder={DEFAULT_TEMPLATE_POST}
        />
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm text-gray-400">
          Archive title format
        </label>
        <input
          type="text"
          value={templateArchive}
          onChange={(e) => setTemplateArchive(e.target.value)}
          className="w-full max-w-md rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          placeholder={DEFAULT_TEMPLATE_ARCHIVE}
        />
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm text-gray-400">
          Page title format
        </label>
        <input
          type="text"
          value={templatePage}
          onChange={(e) => setTemplatePage(e.target.value)}
          className="w-full max-w-md rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
          placeholder={DEFAULT_TEMPLATE_PAGE}
        />
      </div>
      <div className="rounded-md bg-white/5 border border-white/10 p-3 font-sans text-sm text-gray-400">
        <p className="font-semibold text-gray-300 mb-2">Variables legend</p>
        <ul className="list-disc list-inside space-y-1">
          <li><code className="text-gray-300">{"{{title}}"}</code> – The content title.</li>
          <li><code className="text-gray-300">{"{{site_title}}"}</code> – Your global site name.</li>
          <li><code className="text-gray-300">{"{{excerpt}}"}</code> – The short description.</li>
          <li><code className="text-gray-300">{"{{category}}"}</code> – The primary category (Posts only).</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save SEO"}
      </button>
    </section>
  );
}
