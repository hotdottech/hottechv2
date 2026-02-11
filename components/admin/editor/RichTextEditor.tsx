"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { PostCard } from "./extensions/PostCard";
import { SocialCard } from "./extensions/SocialCard";
import {
  Bold,
  Italic,
  List,
  Heading2,
  Heading3,
  Link2,
  ImageIcon,
  Youtube,
  FileText,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPickerModal } from "@/app/components/admin/media/MediaPickerModal";
import { PostPickerModal } from "@/components/admin/media/PostPickerModal";
import type { PostPickerPost } from "@/lib/actions/post-picker";

function getYoutubeId(url: string): string | null {
  const trimmed = url.trim();
  const m = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

type SocialPlatform = "tiktok" | "instagram" | "x" | "unknown";

function getSocialPlatform(url: string): { platform: SocialPlatform; label: string; emoji: string } {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return { platform: "tiktok", label: "View post on TikTok", emoji: "📱" };
  if (u.includes("instagram.com")) return { platform: "instagram", label: "View post on Instagram", emoji: "📷" };
  if (u.includes("twitter.com") || u.includes("x.com")) return { platform: "x", label: "View post on X", emoji: "𝕏" };
  return { platform: "unknown", label: "View link", emoji: "🔗" };
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "rounded p-2 transition-colors",
      active ? "bg-white/20 text-hot-white" : "text-gray-400 hover:bg-white/10 hover:text-hot-white",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {children}
  </button>
);

type RichTextEditorProps = {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Write your story…",
  className,
}: RichTextEditorProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [postPickerOpen, setPostPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      PostCard,
      SocialCard,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-hot-blue underline" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[240px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const handleImageSelect = useCallback(
    (url: string, alt?: string) => {
      if (editor && url) {
        editor.chain().focus().setImage({ src: url, alt: alt ?? "" }).run();
      }
      setImagePickerOpen(false);
    },
    [editor]
  );

  const handleYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube video URL:");
    if (!url) return;
    const id = getYoutubeId(url);
    if (!id) {
      window.alert("Could not parse YouTube URL. Use a link like https://www.youtube.com/watch?v=... or https://youtu.be/...");
      return;
    }
    const embedHtml = `<div class="youtube-embed" style="margin: 16px 0;"><iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe></div>`;
    editor.chain().focus().insertContent(embedHtml).run();
  }, [editor]);

  const handleSocialEmbed = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter social URL (TikTok, Instagram, X):");
    if (!url || !url.trim()) return;
    const href = url.trim();
    const platform = href.includes("tiktok")
      ? "tiktok"
      : href.includes("instagram")
        ? "instagram"
        : href.includes("twitter") || href.includes("x.com")
          ? "x"
          : "link";
    editor.chain().focus().setSocialCard({ platform, url: href }).run();
  }, [editor]);

  const handlePostSelect = useCallback(
    (post: PostPickerPost) => {
      if (!editor) return;
      const image =
        post.image && post.image.trim()
          ? post.image.trim()
          : "https://placehold.co/600x200/1a1a1a/666?text=No+image";
      const title = post.title ?? "";
      const excerpt = (post.excerpt ?? "").slice(0, 160);
      const postUrl = `/blog/${post.slug}`;
      editor
        .chain()
        .focus()
        .setPostCard({
          title,
          excerpt,
          image,
          url: postUrl,
          date: post.published_at ?? undefined,
        })
        .run();
      setPostPickerOpen(false);
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className={cn("rounded-lg border border-white/10 bg-hot-gray overflow-hidden", className)}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-hot-gray/95 p-1 backdrop-blur">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Link URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setImagePickerOpen(true)} title="Insert image from Media Library">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleYoutube} title="Insert YouTube video">
          <Youtube className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setPostPickerOpen(true)} title="Embed post card">
          <FileText className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleSocialEmbed} title="Social embed (TikTok, Instagram, X)">
          <Share2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-md [&_.content-card]:my-4 [&_.youtube-embed]:my-4"
      />

      <MediaPickerModal
        isOpen={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
      />
      <PostPickerModal
        isOpen={postPickerOpen}
        onClose={() => setPostPickerOpen(false)}
        onSelect={handlePostSelect}
      />
    </div>
  );
}
