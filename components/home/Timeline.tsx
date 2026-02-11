"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { TimelineBlockData } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TimelineProps = {
  data?: TimelineBlockData | null;
};

const cardClasses =
  "flex flex-col overflow-hidden rounded-lg border border-white/5 bg-hot-gray/50 shadow-lg backdrop-blur-sm h-full";

export function Timeline({ data }: TimelineProps) {
  const slides = data?.slides ?? [];
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollButtons();
    emblaApi.on("select", updateScrollButtons);
    emblaApi.on("reInit", updateScrollButtons);
  }, [emblaApi, updateScrollButtons]);

  if (slides.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 pb-4">
        <h2 className="font-serif text-2xl font-bold text-hot-white">
          Timeline
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="rounded-full border border-white/10 bg-hot-gray/50 p-2 text-hot-white transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-hot-gray/50"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="rounded-full border border-white/10 bg-hot-gray/50 p-2 text-hot-white transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-hot-gray/50"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y gap-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 flex-[0_0_85%] md:flex-[0_0_40%]"
            >
              <div className={cardClasses}>
                {slide.image && (
                  <div className="relative aspect-video w-full overflow-hidden bg-hot-gray">
                    <img
                      src={slide.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  {slide.year && (
                    <span className="font-sans text-sm font-medium text-hot-white/70">
                      {slide.year}
                    </span>
                  )}
                  <h3 className="mt-1 font-serif text-lg font-medium text-hot-white">
                    {slide.title || "Untitled"}
                  </h3>
                  {slide.description && (
                    <p className="mt-2 font-sans text-sm text-gray-400 line-clamp-3">
                      {slide.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
