"use client";

import type { HomepageBlock } from "@/lib/types";
import type { TimelineBlockData, TimelineSlide } from "@/lib/types";
import { UniversalImagePicker } from "@/app/components/admin/shared/UniversalImagePicker";

type TimelineEditorProps = {
  block: HomepageBlock;
  onChange: (data: TimelineBlockData) => void;
};

function newSlide(): TimelineSlide {
  return {
    id: crypto.randomUUID(),
    year: "",
    title: "",
    description: "",
    image: undefined,
  };
}

const emptyData: TimelineBlockData = { slides: [] };

export function TimelineEditor({ block, onChange }: TimelineEditorProps) {
  const data = (block.data as TimelineBlockData | undefined) ?? emptyData;
  const slides = Array.isArray(data.slides) ? data.slides : [];

  function updateSlide(index: number, slide: TimelineSlide) {
    const next = [...slides];
    next[index] = slide;
    onChange({ ...data, slides: next });
  }

  function addSlide() {
    onChange({ ...data, slides: [...slides, newSlide()] });
  }

  function removeSlide(index: number) {
    const next = slides.filter((_, i) => i !== index);
    onChange({ ...data, slides: next });
  }

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-hot-gray/50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-gray-400">
          Timeline Block
        </h3>
        <button
          type="button"
          onClick={addSlide}
          className="rounded-md bg-white/10 px-3 py-1.5 font-sans text-sm text-hot-white hover:bg-white/20"
        >
          Add Slide
        </button>
      </div>

      <ul className="space-y-4">
        {slides.map((slide, index) => (
          <li
            key={slide.id}
            className="rounded-lg border border-white/10 bg-hot-gray p-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-sans text-xs font-medium text-gray-500">
                Slide {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeSlide(index)}
                className="font-sans text-xs text-gray-400 hover:text-red-400"
              >
                Remove slide
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-1">
              <div>
                <label className="block font-sans text-sm font-medium text-gray-400">
                  Year
                </label>
                <input
                  type="text"
                  value={slide.year}
                  onChange={(e) =>
                    updateSlide(index, { ...slide, year: e.target.value })
                  }
                  placeholder="e.g. 2020"
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) =>
                    updateSlide(index, { ...slide, title: e.target.value })
                  }
                  placeholder="e.g. Joined Forbes"
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-gray-400">
                  Description
                </label>
                <textarea
                  value={slide.description}
                  onChange={(e) =>
                    updateSlide(index, { ...slide, description: e.target.value })
                  }
                  placeholder="Brief description…"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-white/10 bg-hot-black px-3 py-2 font-sans text-hot-white placeholder-gray-500 focus:border-hot-white/30 focus:outline-none focus:ring-1 focus:ring-hot-white/20"
                />
              </div>
              <div>
                <UniversalImagePicker
                  label="Image"
                  value={slide.image}
                  onChange={(url) =>
                    updateSlide(index, { ...slide, image: url || undefined })
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {slides.length === 0 && (
        <p className="font-sans text-sm text-gray-500">
          No slides yet. Click “Add Slide” to add a timeline entry.
        </p>
      )}
    </div>
  );
}
