import { Node } from "@tiptap/core";

export type SocialPlatform = "tiktok" | "instagram" | "x" | "unknown";

export interface SocialCardOptions {
  platform: SocialPlatform;
  url: string;
}

function getPlatformLabel(platform: SocialPlatform): string {
  switch (platform) {
    case "tiktok":
      return "View post on TikTok";
    case "instagram":
      return "View post on Instagram";
    case "x":
      return "View post on X";
    default:
      return "View link";
  }
}

function getPlatformEmoji(platform: SocialPlatform): string {
  switch (platform) {
    case "tiktok":
      return "📱";
    case "instagram":
      return "📷";
    case "x":
      return "𝕏";
    default:
      return "🔗";
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    socialCard: {
      setSocialCard: (options: SocialCardOptions) => ReturnType;
    };
  }
}

const containerStyle =
  "display:flex; align-items:center; padding:12px 16px; border:1px solid #e5e7eb; border-radius:50px; background:#f9fafb; text-decoration:none; width:fit-content; margin:20px auto;";
const textStyle = "margin-left:10px; font-size:14px; font-weight:500; color:#374151;";
const arrowStyle = "margin-left:8px; color:#9ca3af;";

export const SocialCard = Node.create({
  name: "socialCard",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      platform: { default: "unknown" },
      url: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-social-embed="true"]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const url = el.getAttribute("data-url") ?? el.getAttribute("href") ?? "";
          let platform: SocialPlatform = "unknown";
          const u = url.toLowerCase();
          if (u.includes("tiktok.com")) platform = "tiktok";
          else if (u.includes("instagram.com")) platform = "instagram";
          else if (u.includes("twitter.com") || u.includes("x.com")) platform = "x";
          return { platform, url };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { platform, url } = node.attrs;
    const p = (platform as SocialPlatform) || "unknown";
    const label = getPlatformLabel(p);
    const emoji = getPlatformEmoji(p);
    const safeUrl = url && String(url).trim() ? String(url) : "#";

    return [
      "a",
      {
        href: safeUrl,
        "data-social-embed": "true",
        "data-url": safeUrl,
        style: containerStyle,
      },
      ["span", { style: "font-size:1.2em;" }, emoji],
      ["span", { style: textStyle }, label],
      ["span", { style: arrowStyle }, "→"],
    ];
  },

  addCommands() {
    return {
      setSocialCard:
        (options: SocialCardOptions) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              platform: options.platform ?? "unknown",
              url: options.url ?? "",
            },
          });
        },
    };
  },
});
