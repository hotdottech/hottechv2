"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterInput() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error ?? "Something went wrong");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <p className="font-sans text-sm font-medium text-green-500">
        You&apos;re on the list!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="mt-8 w-full max-w-md">
      <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-hot-blue/50 focus-within:ring-1 focus-within:ring-hot-blue/50">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          disabled={status === "loading"}
          className="w-full border-0 bg-transparent px-4 py-3 font-sans text-white placeholder-gray-500 focus:outline-none focus:ring-0 disabled:opacity-70"
          aria-label="Email for newsletter"
          aria-invalid={status === "error"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 bg-white px-4 font-sans text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-70"
          aria-label="Join newsletter"
        >
          {status === "loading" ? (
            <span className="inline-block h-5 w-5 animate-pulse">...</span>
          ) : (
            <span className="flex items-center gap-1">
              Join <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {status === "error" && errorMessage && (
        <p className="mt-2 font-sans text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
