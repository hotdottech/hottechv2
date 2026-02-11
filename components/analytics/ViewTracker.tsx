"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

const VISITOR_ID_KEY = "visitor_id";
const DEBOUNCE_PREFIX = "viewed_post_";
const DEBOUNCE_MS = 30 * 60 * 1000; // 30 minutes

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!slug || fired.current) return;

    const run = async () => {
      const sessionKey = `${DEBOUNCE_PREFIX}${slug}`;
      try {
        const raw = sessionStorage.getItem(sessionKey);
        if (raw) {
          const at = parseInt(raw, 10);
          if (!Number.isNaN(at) && Date.now() - at < DEBOUNCE_MS) return;
        }
      } catch {
        // ignore
      }

      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return;

      const visitorId = getOrCreateVisitorId();
      if (!visitorId) return;

      try {
        const res = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            visitorId,
            referrer: typeof document !== "undefined" ? document.referrer || null : null,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent || null : null,
          }),
        });
        if (res.ok) {
          fired.current = true;
          try {
            sessionStorage.setItem(sessionKey, String(Date.now()));
          } catch {
            // ignore
          }
        }
      } catch {
        // fail silently
      }
    };

    run();
  }, [slug]);

  return null;
}
