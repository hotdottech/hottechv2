"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { subscribe, type SubscribeState } from "@/lib/actions/subscribe";

type NewsletterFormProps = {
  source: string;
  tags?: string[];
  variant?: "inline" | "stack";
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 shrink-0 rounded-md bg-white px-6 font-sans text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-70"
    >
      {pending ? "Joining…" : "Join"}
    </button>
  );
}

export function NewsletterForm({
  source,
  tags = ["newsletter"],
  variant = "inline",
}: NewsletterFormProps) {
  const [state, formAction] = useActionState<SubscribeState | null, FormData>(
    subscribe,
    null
  );

  const tagsValue = Array.isArray(tags) && tags.length > 0 ? tags.join(",") : "newsletter";

  if (state?.success) {
    return (
      <p className="font-sans text-sm font-medium text-green-500">
        You&apos;re in! Check your inbox.
      </p>
    );
  }

  const isStack = variant === "stack";
  return (
    <form
      action={formAction}
      className={
        isStack
          ? "flex w-full max-w-md flex-col gap-3"
          : "flex w-full max-w-md items-center gap-3"
      }
    >
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="tags" value={tagsValue} />
      <input
        type="email"
        name="email"
        placeholder="Your email"
        required
        className="h-12 w-full flex-1 rounded-md border border-white/10 bg-white/5 px-4 font-sans text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-0"
        aria-label="Email for newsletter"
      />
      <SubmitButton />
      {state && !state.success && state.message && (
        <p className="font-sans text-sm text-red-400" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
