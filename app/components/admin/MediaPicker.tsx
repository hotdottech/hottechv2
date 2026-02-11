"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import imageCompression from "browser-image-compression";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET = "all_media";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mime_type: string | null;
  size: number | null;
  alt_text: string | null;
  created_at: string;
};

type MediaPickerProps = {
  onSelect: (url: string) => void;
  onCancel: () => void;
};

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function MediaPicker({ onSelect, onCancel }: MediaPickerProps) {
  const [view, setView] = useState<"Upload" | "Library">("Upload");
  const [images, setImages] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabase();

  const fetchImages = useCallback(async () => {
    setLibraryLoading(true);
    const { data, error } = await supabase
      .from("media_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setImages((data as MediaItem[]) ?? []);
    setLibraryLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (view === "Library") fetchImages();
  }, [view, fetchImages]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return;
      }
      setError(null);
      setUploading(true);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, compressed, {
            contentType: compressed.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const url = urlData.publicUrl;

        const { error: insertError } = await supabase.from("media_items").insert({
          filename: file.name,
          url,
          mime_type: compressed.type,
          size: compressed.size,
        });

        if (insertError) {
          throw insertError;
        }

        onSelect(url);
      } catch (e: unknown) {
        const err = e as { message?: string; details?: string; hint?: string };
        console.error("Upload failed:", err?.message, err?.details, err?.hint);
        setError(err?.message ?? "Upload failed. Check console.");
      } finally {
        setUploading(false);
      }
    },
    [supabase, onSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-lg border border-white/10 bg-black text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-lg font-semibold">Choose image</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            type="button"
            onClick={() => setView("Upload")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
              view === "Upload"
                ? "border-b-2 border-white text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setView("Library")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
              view === "Library"
                ? "border-b-2 border-white text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Library
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {view === "Upload" && (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 transition ${
                dragActive ? "border-white/50 bg-white/5" : "border-white/20"
              } ${uploading ? "pointer-events-none opacity-60" : ""}`}
            >
              <UploadCloud className="mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-2 text-sm text-gray-400">
                Drag and drop an image, or click to browse
              </p>
              <p className="mb-4 text-xs text-gray-500">
                JPEG, PNG, WebP, GIF up to 5MB
              </p>
              <label className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-200">
                <input
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  onChange={onInputChange}
                  className="hidden"
                />
                Select file
              </label>
              {uploading && (
                <p className="mt-3 text-xs text-gray-400">Optimizing & Uploading…</p>
              )}
              {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              )}
            </div>
          )}

          {view === "Library" && (
            <div className="space-y-3">
              {libraryLoading ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  Loading library…
                </p>
              ) : images.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  No images yet. Upload one in the Upload tab.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.url)}
                      className="aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-white/30 hover:bg-white/10"
                    >
                      <img
                        src={item.url}
                        alt={item.alt_text ?? item.filename}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
