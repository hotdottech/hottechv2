"use client";

import { useState } from "react";
import { sendTestEmail, broadcastNewsletter } from "./actions";

type Props = {
  slug: string;
  documentId: string;
  subscriberCount: number;
};

export function NewsletterWarRoom({
  slug,
  documentId,
  subscriberCount,
}: Props) {
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [broadcastError, setBroadcastError] = useState("");
  const [broadcastCount, setBroadcastCount] = useState<number | null>(null);

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    const email = testEmail.trim();
    if (!email) return;
    setTestStatus("sending");
    setTestError("");
    const result = await sendTestEmail(slug, email);
    if (result.error) {
      setTestError(result.error);
      setTestStatus("error");
    } else {
      setTestStatus("ok");
    }
  }

  async function handleBroadcast() {
    const confirmed = window.confirm(
      `Are you sure? This will send the campaign to ${subscriberCount} people.`
    );
    if (!confirmed) return;
    setBroadcastStatus("sending");
    setBroadcastError("");
    setBroadcastCount(null);
    const result = await broadcastNewsletter(slug);
    if (result.error) {
      setBroadcastError(result.error);
      setBroadcastStatus("error");
    } else {
      setBroadcastStatus("ok");
      setBroadcastCount(result.count ?? 0);
    }
  }

  return (
    <div className="space-y-4">
      {/* Card 1: Audience */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="font-sans text-sm font-medium text-hot-white">
          Audience
        </h3>
        <p className="mt-1 font-sans text-sm text-gray-400">
          Ready to send to{" "}
          <span className="font-semibold text-hot-white">{subscriberCount}</span>{" "}
          subscribers.
        </p>
      </div>

      {/* Card 2: Test – Send logic commented out for now */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="font-sans text-sm font-medium text-hot-white">
          Send test
        </h3>
        <form onSubmit={handleSendTest} className="mt-3 space-y-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-sm text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
            required
          />
          <button
            type="submit"
            disabled={testStatus === "sending"}
            className="w-full rounded-md border border-white/20 bg-white/10 py-2 font-sans text-sm font-medium text-hot-white transition-colors hover:bg-white/15 disabled:opacity-50"
          >
            {testStatus === "sending" ? "Sending…" : "Send test"}
          </button>
          {testStatus === "ok" && (
            <p className="text-sm text-green-400">Test email sent.</p>
          )}
          {testStatus === "error" && testError && (
            <p className="text-sm text-red-400">{testError}</p>
          )}
        </form>
      </div>

      {/* Card 3: Actions – Broadcast commented out for now */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="font-sans text-sm font-medium text-hot-white">
          Actions
        </h3>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={handleBroadcast}
            disabled={broadcastStatus === "sending"}
            className="w-full rounded-md bg-red-600 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {broadcastStatus === "sending"
              ? "Sending…"
              : "Broadcast campaign"}
          </button>
          {broadcastStatus === "ok" && broadcastCount !== null && (
            <p className="text-sm text-green-400">
              Sent to {broadcastCount} subscribers.
            </p>
          )}
          {broadcastStatus === "error" && broadcastError && (
            <p className="text-sm text-red-400">{broadcastError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
