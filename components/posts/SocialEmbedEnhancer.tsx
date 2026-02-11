"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
        createTweet: (
          tweetId: string,
          container: HTMLElement,
          options?: { theme?: string; align?: string }
        ) => Promise<HTMLElement | null>;
      };
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

function getTweetId(url: string): string | null {
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : null;
}

function renderTweet(container: HTMLElement, tweetId: string): void {
  if (typeof window === "undefined" || !window.twttr?.widgets?.createTweet) return;
  window.twttr.widgets.createTweet(tweetId, container, {
    theme: "dark",
    align: "center",
  });
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
  const tweetId = getTweetId(url);
  if (!tweetId) return;

  const container = document.createElement("div");
  container.className = "twitter-embed-container";
  container.style.minHeight = "250px";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  el.replaceWith(container);

  const TWITTER_SCRIPT = "https://platform.twitter.com/widgets.js";
  const runCreate = () => renderTweet(container, tweetId);

  if (typeof window !== "undefined" && window.twttr?.widgets?.createTweet) {
    runCreate();
  } else {
    loadScript(TWITTER_SCRIPT, runCreate);
  }
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
