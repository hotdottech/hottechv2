"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

const VISITOR_ID_KEY = "visitor_id";
const DEBOUNCE_PREFIX_POST = "viewed_post_";
const DEBOUNCE_PREFIX_PAGE = "viewed_page_";
const DEBOUNCE_MS = 30 * 60 * 1000; // 30 minutes

function sessionKey(slug: string | undefined, customPath: string | undefined): string {
  if (slug) return `${DEBOUNCE_PREFIX_POST}${slug}`;
  if (customPath !== undefined && customPath !== null) {
    const pathNorm = customPath === "/" ? "home" : customPath.replace(/\//g, "_").replace(/^_/, "");
    return `${DEBOUNCE_PREFIX_PAGE}${pathNorm}`;
  }
  return "";
}

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

export function ViewTracker({
  slug,
  customPath,
}: {
  slug?: string;
  customPath?: string;
}) {
  const fired = useRef(false);
  const key = sessionKey(slug, customPath);

  useEffect(() => {
    if (!key || fired.current) return;

    const run = async () => {
      try {
        const raw = sessionStorage.getItem(key);
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

      const payload: Record<string, unknown> = {
        visitorId,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent || null : null,
      };
      if (customPath !== undefined && customPath !== null) {
        payload.path = customPath;
      } else if (slug) {
        payload.slug = slug;
      }

      try {
        const res = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fired.current = true;
          try {
            sessionStorage.setItem(key, String(Date.now()));
          } catch {
            // ignore
          }
        }
      } catch {
        // fail silently
      }
    };

    run();
  }, [key, slug, customPath]);

  return null;
}
