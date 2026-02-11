import { Node } from "@tiptap/core";

export type SocialPlatform = "tiktok" | "instagram" | "x" | "link" | "unknown";

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
    case "link":
    case "unknown":
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
    case "link":
    case "unknown":
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

  priority: 1000,

  group: "block",
  atom: true,

  addAttributes() {
    return {
      platform: {
        default: "link",
        parseHTML: (element) => element.getAttribute("data-platform") ?? "link",
      },
      url: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-url") ?? element.getAttribute("href") ?? "",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-type="social-card"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const platform = (HTMLAttributes.platform ?? node.attrs.platform ?? "link") as SocialPlatform;
    const url = HTMLAttributes.url ?? node.attrs.url ?? "";
    const safeUrl = url && String(url).trim() ? String(url) : "#";
    const label = getPlatformLabel(platform);
    const emoji = getPlatformEmoji(platform);

    return [
      "a",
      {
        ...HTMLAttributes,
        href: safeUrl,
        "data-type": "social-card",
        "data-platform": platform,
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
