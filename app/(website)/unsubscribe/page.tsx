"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { unsubscribeUser } from "./actions";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnsubscribe = useCallback(async () => {
    if (!id.trim()) {
      setErrorMessage("Invalid link. Please use the unsubscribe link from your email.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMessage("");
    const result = await unsubscribeUser(id);
    if (result.error) {
      setErrorMessage(result.error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }, [id]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-hot-white md:text-4xl">
        Unsubscribe from Hot Tech
      </h1>

      {status === "idle" && (
        <>
          <p className="mt-4 font-sans text-lg text-gray-400">
            Click the button below to stop receiving our newsletter.
          </p>
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={!id.trim()}
            className="mt-8 inline-block rounded-md bg-hot-white px-6 py-3 font-sans font-medium text-hot-black transition-colors hover:bg-hot-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unsubscribe me
          </button>
        </>
      )}

      {status === "loading" && (
        <p className="mt-8 font-sans text-gray-400">Processing…</p>
      )}

      {status === "success" && (
        <>
          <p className="mt-4 font-sans text-lg text-gray-400">
            You have been removed from the list.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-md bg-hot-white px-6 py-3 font-sans font-medium text-hot-black transition-colors hover:bg-hot-white/90"
          >
            Back to Home
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <p className="mt-4 font-sans text-lg text-red-400">{errorMessage}</p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-md bg-hot-white px-6 py-3 font-sans font-medium text-hot-black transition-colors hover:bg-hot-white/90"
          >
            Back to Home
          </Link>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
