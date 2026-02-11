"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addSubscriber,
  deleteSubscriber,
} from "@/lib/actions/subscribers";
import type { Subscriber } from "@/lib/types";
import { format } from "date-fns";

type Props = {
  subscribers: Subscriber[];
  activeCount: number;
};

export function SubscribersManager({ subscribers, activeCount }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setAdding(true);
    setMessage(null);
    const result = await addSubscriber(trimmed);
    setAdding(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setEmail("");
      setModalOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this subscriber? This cannot be undone.")) return;
    const result = await deleteSubscriber(id);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold text-hot-white">
          Subscribers
        </h1>
        <button
          type="button"
          onClick={() => { setModalOpen(true); setMessage(null); }}
          className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90"
        >
          Add Subscriber
        </button>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <p className="font-sans text-lg font-medium text-hot-white">
          Total Active Subscribers
        </p>
        <p className="mt-1 font-sans text-3xl font-bold text-hot-white">
          {activeCount}
        </p>
      </div>

      {message && (
        <p
          className={
            message.type === "error"
              ? "font-sans text-sm text-red-400"
              : "font-sans text-sm text-green-400"
          }
        >
          {message.text}
        </p>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
        <div className="min-h-0 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Segments
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => {
                  const segments = sub.preferences?.segments;
                  const hasSegments = Array.isArray(segments) && segments.length > 0;
                  return (
                  <tr
                    key={sub.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-hot-white">{sub.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          sub.status === "active"
                            ? "inline-flex rounded-full bg-green-500/20 px-2.5 py-0.5 font-sans text-xs font-medium text-green-400"
                            : "inline-flex rounded-full bg-red-500/20 px-2.5 py-0.5 font-sans text-xs font-medium text-red-400"
                        }
                      >
                        {sub.status === "active"
                          ? "Active"
                          : sub.status === "bounced"
                            ? "Bounced"
                            : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {hasSegments ? (
                        <span className="flex flex-wrap gap-1">
                          {segments.map((segment) => (
                            <span
                              key={segment}
                              className="mr-1 rounded-full bg-white/10 px-2 py-0.5 font-sans text-xs"
                            >
                              {segment}
                            </span>
                          ))}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {sub.created_at
                        ? format(
                            new Date(sub.created_at),
                            "MMM d, yyyy"
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        className="rounded-md border border-red-500/50 px-3 py-1.5 font-sans text-sm text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !adding && setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-white/10 bg-hot-black p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-sans text-lg font-semibold text-hot-white">
              Add Subscriber
            </h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block font-sans text-sm text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. test@houseoftech.com"
                  required
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-white/40 focus:outline-none"
                />
              </div>
              {message && (
                <p
                  className={
                    message.type === "error"
                      ? "font-sans text-sm text-red-400"
                      : "font-sans text-sm text-green-400"
                  }
                >
                  {message.text}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => !adding && setModalOpen(false)}
                  className="rounded-md border border-white/20 px-4 py-2 font-sans text-sm text-hot-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-md bg-hot-white px-4 py-2 font-sans text-sm font-medium text-hot-black transition-colors hover:bg-hot-white/90 disabled:opacity-50"
                >
                  {adding ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
