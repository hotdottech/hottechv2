"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";
import { AudienceSelector } from "@/components/admin/newsletters/AudienceSelector";
import { UniversalImagePicker } from "@/app/components/admin/shared/UniversalImagePicker";
import {
  createNewsletter,
  updateNewsletter,
  sendTestEmailWithPayload,
  broadcastNewsletter,
  type NewsletterRow,
  type TestEmailPayload,
} from "@/app/(admin)/admin/newsletters/actions";
import type { TargetConfig } from "@/lib/actions/newsletter-audience";
import { calculateRecipientCount } from "@/lib/actions/newsletter-audience";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

function parseAudience(targetConfig: unknown): TargetConfig {
  if (targetConfig == null || typeof targetConfig !== "object") {
    return { type: "all", filters: { sources: [], tags: [] }, manual_ids: [] };
  }
  const o = targetConfig as Record<string, unknown>;
  const type = (o.type as TargetConfig["type"]) ?? "all";
  const filters =
    type === "filter" && o.filters && typeof o.filters === "object"
      ? {
          sources: Array.isArray((o.filters as Record<string, unknown>).sources)
            ? ((o.filters as Record<string, unknown>).sources as string[])
            : [],
          tags: Array.isArray((o.filters as Record<string, unknown>).tags)
            ? ((o.filters as Record<string, unknown>).tags as string[])
            : [],
        }
      : { sources: [], tags: [] };
  const manual_ids =
    type === "manual" && Array.isArray(o.manual_ids) ? (o.manual_ids as string[]) : [];
  return { type, filters, manual_ids };
}

type NewsletterFormProps = {
  initialData?: NewsletterRow | null;
};

export function NewsletterForm({ initialData }: NewsletterFormProps) {
  const router = useRouter();

  const [id, setId] = useState<string | null>(initialData?.id ?? null);
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [previewText, setPreviewText] = useState(initialData?.preview_text ?? "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(initialData?.featured_image ?? null);
  const [content, setContent] = useState(initialData?.content ?? "");
  const [audience, setAudience] = useState<TargetConfig>(() =>
    parseAudience(initialData?.target_config ?? null)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [broadcastError, setBroadcastError] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  const currentPayload: TestEmailPayload = useMemo(
    () => ({
      subject,
      content,
      previewText,
      slug: slug || id || undefined,
    }),
    [subject, content, previewText, slug, id]
  );

  const isSent = initialData?.status === "sent";

  const saveDraft = useCallback(
    async (skipNavigate?: boolean, keepStatusSent?: boolean): Promise<string | null> => {
      setError("");
      setSaving(true);
      const formData = new FormData();
      formData.set("subject", subject);
      formData.set("slug", slug);
      formData.set("preview_text", previewText);
      formData.set("featured_image", featuredImage ?? "");
      formData.set("content", content);
      formData.set(
        "status",
        keepStatusSent && initialData?.status === "sent" ? "sent" : "draft"
      );
      formData.set("target_config", JSON.stringify(audience));

      if (id) {
        const result = await updateNewsletter(id, formData);
        setSaving(false);
        if (result.error) {
          setError(result.error);
          return null;
        }
        return id;
      } else {
        const result = await createNewsletter(formData);
        setSaving(false);
        if (result.error) {
          setError(result.error);
          return null;
        }
        if (result.id) {
          setId(result.id);
          if (!skipNavigate) router.replace(`/admin/newsletters/${result.id}`);
          return result.id;
        }
        return null;
      }
    },
    [id, subject, slug, previewText, featuredImage, content, audience, initialData?.status, router]
  );

  const handleSaveDraft = useCallback(async () => {
    await saveDraft(undefined, isSent);
  }, [saveDraft, isSent]);

  const handlePreview = useCallback(() => {
    if (slug?.trim()) window.open("/newsletters/" + slug.trim(), "_blank");
  }, [slug]);

  const handleSendTest = useCallback(() => {
    setTestEmail("");
    setTestError("");
    setTestStatus("idle");
    setTestModalOpen(true);
  }, []);

  const handleTestSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const email = testEmail.trim();
      if (!email) return;
      setTestStatus("sending");
      setTestError("");
      const result = await sendTestEmailWithPayload(currentPayload, email);
      if (result.error) {
        setTestError(result.error);
        setTestStatus("error");
      } else {
        setTestStatus("ok");
      }
    },
    [currentPayload, testEmail]
  );

  const handleBroadcastClick = useCallback(() => {
    setBroadcastError("");
    setBroadcastStatus("idle");
    setBroadcastModalOpen(true);
    calculateRecipientCount(audience).then(setRecipientCount);
  }, [audience]);

  const handleBroadcast = useCallback(async () => {
    setBroadcastStatus("sending");
    setBroadcastError("");
    const savedId = await saveDraft(true, isSent);
    if (savedId == null) {
      setBroadcastStatus("error");
      setBroadcastError("Could not save draft.");
      return;
    }
    const result = await broadcastNewsletter(savedId);
    if (result.error) {
      setBroadcastError(result.error);
      setBroadcastStatus("error");
    } else {
      setBroadcastStatus("ok");
      setBroadcastModalOpen(false);
      router.push("/admin/newsletters");
    }
  }, [saveDraft, isSent, router]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/newsletters"
          className="font-sans text-sm text-gray-400 hover:text-hot-white"
        >
          ← Campaigns
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="rounded-md border border-white/20 bg-white/10 px-4 py-2 font-sans text-sm font-medium text-hot-white transition-colors hover:bg-white/15 disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : isSent
                ? "Update Web Version"
                : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!slug?.trim()}
            className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm font-medium text-hot-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSendTest}
            className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm font-medium text-hot-white transition-colors hover:bg-white/10"
          >
            Send Test
          </button>
          <button
            type="button"
            onClick={handleBroadcastClick}
            className="rounded-md bg-red-600 px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            Broadcast
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Main Content (Left) */}
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

          <AudienceSelector value={audience} onChange={setAudience} />

          <div>
            <label className="block font-sans text-sm font-medium text-gray-400">
              Content
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your newsletter…"
              className="mt-2"
            />
          </div>
        </div>

        {/* Sidebar (Right) */}
        <aside className="w-full shrink-0 space-y-4 lg:w-[33.333%]">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="font-sans text-sm font-medium text-hot-white">
              Featured Image
            </h3>
            <UniversalImagePicker
              value={featuredImage}
              onChange={(url) => setFeaturedImage(url || null)}
              label=""
            />
          </div>

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
        </aside>
      </div>

      {/* Send Test Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-hot-gray p-6">
            <h3 className="font-sans text-lg font-semibold text-hot-white">
              Send test email
            </h3>
            <form onSubmit={handleTestSubmit} className="mt-4 space-y-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="flex-1 rounded-md border border-white/20 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testStatus === "sending"}
                  className="flex-1 rounded-md bg-hot-white px-3 py-2 font-sans text-sm font-medium text-hot-black disabled:opacity-50"
                >
                  {testStatus === "sending" ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
            {testStatus === "ok" && (
              <p className="mt-3 text-sm text-green-400">Test email sent.</p>
            )}
            {testStatus === "error" && testError && (
              <p className="mt-3 text-sm text-red-400">{testError}</p>
            )}
          </div>
        </div>
      )}

      {/* Confirm Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-hot-gray p-6">
            <h3 className="font-sans text-lg font-semibold text-hot-white">
              Confirm Broadcast
            </h3>
            <p className="mt-2 font-sans text-sm text-gray-400">
              This will send the campaign to{" "}
              <span className="font-semibold text-hot-white">
                {recipientCount != null ? recipientCount : "…"}
              </span>{" "}
              recipient{recipientCount === 1 ? "" : "s"}. Are you sure?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                disabled={broadcastStatus === "sending"}
                className="flex-1 rounded-md border border-white/20 px-3 py-2 font-sans text-sm text-hot-white hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcast}
                disabled={broadcastStatus === "sending"}
                className="flex-1 rounded-md bg-red-600 px-3 py-2 font-sans text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {broadcastStatus === "sending" ? "Sending…" : "Yes, broadcast"}
              </button>
            </div>
            {broadcastStatus === "ok" && (
              <p className="mt-3 text-sm text-green-400">Campaign sent successfully.</p>
            )}
            {broadcastStatus === "error" && broadcastError && (
              <p className="mt-3 text-sm text-red-400">{broadcastError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
