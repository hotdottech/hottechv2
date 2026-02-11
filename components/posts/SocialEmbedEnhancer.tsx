"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: { load: (element?: HTMLElement) => void };
    };
  }
}

const SCRIPT_LOADED: Record<string, boolean> = {};

function loadScript(src: string, onload?: () => void): void {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    onload?.();
    return;
  }
  if (SCRIPT_LOADED[src]) {
    onload?.();
    return;
  }
  SCRIPT_LOADED[src] = true;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  if (onload) script.onload = onload;
  document.head.appendChild(script);
}

function loadTwitterWidgetsForElement(element: HTMLElement): void {
  if (typeof window === "undefined" || !window.twttr?.widgets?.load) return;
  window.twttr.widgets.load(element);
}

function getTikTokVideoId(url: string): string | null {
  const m = url.match(/tiktok\.com\/[^/]+\/video\/(\d+)/);
  return m ? m[1] : null;
}

function enhanceTikTok(el: HTMLElement, url: string): void {
  const videoId = getTikTokVideoId(url);
  if (!videoId) return;
  const blockquote = document.createElement("blockquote");
  blockquote.className = "tiktok-embed";
  blockquote.setAttribute("cite", url);
  blockquote.setAttribute("data-video-id", videoId);
  blockquote.setAttribute("data-embed-from", "oembed");
  blockquote.style.maxWidth = "605px";
  blockquote.style.minWidth = "325px";
  const section = document.createElement("section");
  blockquote.appendChild(section);
  el.replaceWith(blockquote);
  loadScript("https://www.tiktok.com/embed.js");
}

function enhanceInstagram(el: HTMLElement, url: string): void {
  const blockquote = document.createElement("blockquote");
  blockquote.className = "instagram-media";
  blockquote.setAttribute("data-instgrm-permalink", url);
  blockquote.setAttribute("data-instgrm-version", "14");
  el.replaceWith(blockquote);
  loadScript("https://www.instagram.com/embed.js");
}

function enhanceTwitter(el: HTMLElement, url: string): void {
  const blockquote = document.createElement("blockquote");
  blockquote.className = "twitter-tweet";
  blockquote.setAttribute("data-dnt", "true");
  blockquote.setAttribute("data-theme", "dark");
  const anchor = document.createElement("a");
  anchor.href = url;
  blockquote.appendChild(anchor);
  el.replaceWith(blockquote);

  const TWITTER_SCRIPT = "https://platform.twitter.com/widgets.js";
  const runLoad = () => loadTwitterWidgetsForElement(blockquote);

  setTimeout(() => {
    if (typeof window !== "undefined" && window.twttr?.widgets?.load) {
      runLoad();
    } else {
      loadScript(TWITTER_SCRIPT, runLoad);
    }
  }, 50);
}

export function SocialEmbedEnhancer() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-type="social-card"]');
    cards.forEach((el) => {
      const platform = (el.dataset.platform ?? "").toLowerCase();
      const url = (el.dataset.url ?? "").trim();
      if (!url) return;
      const u = url.toLowerCase();

      if (platform === "tiktok" || u.includes("tiktok.com")) {
        enhanceTikTok(el, url);
      } else if (platform === "instagram" || u.includes("instagram.com")) {
        enhanceInstagram(el, url);
      } else if (
        platform === "x" ||
        platform === "twitter" ||
        u.includes("twitter.com") ||
        u.includes("x.com")
      ) {
        enhanceTwitter(el, url);
      }
      // "link" / "unknown" / legacy: leave as static card (no replace)
    });
  }, []);

  return null;
}
