"use client";

import { useActionState } from "react";

type LoginAction = (
  prev: { error?: string } | null,
  formData: FormData
) => Promise<{ error?: string } | void>;

export function LoginForm({
  action,
  next,
}: {
  action: LoginAction;
  next?: string;
}) {
  const [state, formAction] = useActionState(
    async (prev: { error?: string } | null, formData: FormData) => {
      if (next) formData.set("next", next);
      return (await action(prev, formData)) ?? null;
    },
    null as { error?: string } | null
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-400"
        >
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block font-sans text-sm font-medium text-gray-400"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 block w-full rounded-md border border-white/10 bg-hot-gray px-4 py-3 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block font-sans text-sm font-medium text-gray-400"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 block w-full rounded-md border border-white/10 bg-hot-gray px-4 py-3 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
        />
      </div>
      {next && <input type="hidden" name="next" value={next} />}
      <button
        type="submit"
        className="w-full rounded-md bg-hot-white py-3 font-sans font-medium text-hot-black transition-colors hover:bg-hot-white/90"
      >
        Sign in
      </button>
    </form>
  );
}
