"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function AdminDashboardShortcut() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    getSupabase()
      .auth.getUser()
      .then(({ data: { user } }) => setShow(!!user));
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/admin"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 font-sans text-sm text-gray-200 shadow-lg backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-black/80 hover:text-white"
      aria-label="Admin dashboard"
    >
      <LayoutDashboard className="h-4 w-4" />
      <span>Admin</span>
    </Link>
  );
}
