"use client";

import { useRef, useState } from "react";
import { uploadPostImage } from "@/app/(admin)/admin/posts/actions";
import { compressImage } from "@/lib/image-compression";

type ImagePickerProps = {
  value: string | null | undefined;
  onChange: (url: string) => void;
};

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = value?.trim() || null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setError(null);
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.set("file", compressed);
      const result = await uploadPostImage(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) onChange(result.url);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    onChange("");
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {url ? (
        <div className="relative inline-block">
          <img
            src={url}
            alt=""
            className="max-h-40 rounded-md object-cover"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-gray-400 hover:text-hot-white disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Change"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-gray-400 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center rounded-md border border-dashed border-white/20 py-8 font-sans text-sm text-gray-400 transition-colors hover:border-white/30 hover:text-hot-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      )}
      {error && (
        <p className="font-sans text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
