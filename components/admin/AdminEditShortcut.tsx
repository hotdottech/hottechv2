"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function AdminEditShortcut({ url }: { url: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!url) return;
    getSupabase()
      .auth.getUser()
      .then(({ data: { user } }) => setShow(!!user));
  }, [url]);

  if (!url || !show) return null;

  return (
    <Link
      href={url}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 font-sans text-sm font-medium text-white shadow-lg transition-colors hover:bg-emerald-500"
      aria-label="Edit page"
    >
      <Pencil className="h-4 w-4" />
      <span>Edit Page</span>
    </Link>
  );
}
