import { Node } from "@tiptap/core";

export interface PostCardOptions {
  title: string;
  excerpt: string;
  image: string;
  url: string;
  date?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    postCard: {
      setPostCard: (options: PostCardOptions) => ReturnType;
    };
  }
}

const containerStyle =
  "display:flex; gap:16px; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; text-decoration:none; color:inherit; background:#ffffff; margin:24px 0; align-items:stretch; max-width:100%; box-shadow:0 1px 3px rgba(0,0,0,0.1);";
const imageStyle =
  "flex:0 0 160px; width:160px; min-height:120px; background-size:cover; background-position:center;";
const contentStyle =
  "flex:1; padding:16px; display:flex; flex-direction:column; justify-content:center; min-width:0;";
const titleStyle =
  "margin:0 0 8px 0; font-size:18px; font-weight:600; line-height:1.3; color:#111;";
const excerptStyle =
  "margin:0; font-size:14px; color:#666; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;";
const readMoreStyle =
  "margin-top:12px; font-size:13px; font-weight:500; color:#7c3aed; text-transform:uppercase; letter-spacing:0.5px;";

export const PostCard = Node.create({
  name: "postCard",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      title: { default: "" },
      excerpt: { default: "" },
      image: { default: "" },
      url: { default: "" },
      date: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="postCard"]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          return {
            title: el.getAttribute("data-title") ?? "",
            excerpt: el.getAttribute("data-excerpt") ?? "",
            image: el.getAttribute("data-image") ?? "",
            url: el.getAttribute("href") ?? el.getAttribute("data-url") ?? "",
            date: el.getAttribute("data-date"),
          };
        },
      },
      {
        tag: "a.content-card",
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const href = el.getAttribute("href") ?? "";
          const imgEl = el.querySelector("[data-card-image]") as HTMLElement | null;
          const titleEl = el.querySelector("h3");
          const excerptEl = el.querySelector("p");
          const image =
            imgEl?.style?.backgroundImage?.match(/url\(["']?([^"')]+)["']?\)/)?.[1] ??
            imgEl?.getAttribute("data-src") ??
            "";
          return {
            title: titleEl?.textContent?.trim() ?? "",
            excerpt: excerptEl?.textContent?.trim() ?? "",
            image: image,
            url: href,
            date: null,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { title, excerpt, image, url } = node.attrs;
    const imgSrc =
      image && String(image).trim()
        ? String(image).replace(/'/g, "%27")
        : "https://placehold.co/600x200/1a1a1a/666?text=No+image";
    const safeUrl = url && String(url).trim() ? String(url) : "#";

    return [
      "a",
      {
        href: safeUrl,
        class: "content-card",
        "data-type": "postCard",
        "data-title": title,
        "data-excerpt": excerpt,
        "data-image": image,
        "data-url": safeUrl,
        "data-date": node.attrs.date || "",
        style: containerStyle,
      },
      [
        "div",
        {
          style: `${imageStyle} background-image:url('${imgSrc}');`,
          "data-card-image": "true",
          "data-src": image,
        },
      ],
      [
        "div",
        { style: contentStyle },
        ["h3", { style: titleStyle }, title || "Untitled"],
        ["p", { style: excerptStyle }, excerpt || ""],
        ["span", { style: readMoreStyle }, "Read More →"],
      ],
    ];
  },

  addCommands() {
    return {
      setPostCard:
        (options: PostCardOptions) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: options.title ?? "",
              excerpt: options.excerpt ?? "",
              image: options.image ?? "",
              url: options.url ?? "",
              date: options.date ?? null,
            },
          });
        },
    };
  },
});
