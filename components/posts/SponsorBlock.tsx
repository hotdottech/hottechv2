"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { SponsorBlockData, SponsorItem } from "@/lib/types/post";

type SponsorBlockProps = {
  data: SponsorBlockData;
};

const SIZE_HEIGHT: Record<SponsorBlockData["size"], string> = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
  xl: "h-32",
};

const SIZE_GAP: Record<SponsorBlockData["size"], string> = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-10",
};

const TITLE_COLOR_CLASS: Record<SponsorBlockData["titleColor"], string> = {
  default: "text-hot-white",
  primary: "text-hot-white",
  muted: "text-gray-500 uppercase tracking-widest text-sm",
  gold: "text-yellow-500",
  red: "text-red-600",
};

const ALIGN_CLASS: Record<SponsorBlockData["alignment"], string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const GRID_COLS_CLASS: Record<SponsorBlockData["columns"], string> = {
  "1": "md:grid-cols-1",
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-3",
  "4": "md:grid-cols-4",
  "5": "md:grid-cols-5",
  "6": "md:grid-cols-6",
};

function normalizeData(raw: SponsorBlockData | null | undefined): SponsorBlockData | null {
  if (!raw || !Array.isArray(raw.items)) return null;
  const items: SponsorItem[] = raw.items
    .filter(
      (x): x is Record<string, unknown> =>
        x != null && typeof x === "object" && typeof (x as SponsorItem).id === "string"
    )
    .map((x) => ({
      id: String((x as SponsorItem).id),
      imageUrl: typeof (x as SponsorItem).imageUrl === "string" ? (x as SponsorItem).imageUrl : "",
      linkUrl: typeof (x as SponsorItem).linkUrl === "string" ? (x as SponsorItem).linkUrl : undefined,
      altText: typeof (x as SponsorItem).altText === "string" ? (x as SponsorItem).altText : undefined,
      partnerLabel:
        typeof (x as SponsorItem).partnerLabel === "string" ? (x as SponsorItem).partnerLabel : undefined,
    }));
  if (items.length === 0) return null;
  return {
    title: raw.title?.trim(),
    titleTag: raw.titleTag ?? "h3",
    titleColor: raw.titleColor ?? "default",
    items,
    columns: raw.columns ?? "3",
    size: raw.size ?? "md",
    alignment: raw.alignment ?? "center",
    grayscale: !!raw.grayscale,
  };
}

export function SponsorBlock({ data: rawData }: SponsorBlockProps) {
  const data = normalizeData(rawData);
  if (!data) return null;

  const alignClass = ALIGN_CLASS[data.alignment];
  const titleColorClass = TITLE_COLOR_CLASS[data.titleColor];
  const gridCols = cn("grid-cols-2", GRID_COLS_CLASS[data.columns]);
  const gapClass = SIZE_GAP[data.size];
  const imgHeightClass = SIZE_HEIGHT[data.size];

  const TitleTag = data.titleTag;

  return (
    <section
      className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8")}
      aria-label={data.title || "Sponsors"}
    >
      <div className={cn("flex flex-col", alignClass)}>
        {data.title && (
          <TitleTag className={cn("font-serif font-semibold", titleColorClass)}>
            {data.title}
          </TitleTag>
        )}
        <div className={cn("mt-6 grid w-full", gridCols, gapClass)}>
          {data.items.map((item) => {
            const content = (
              <>
                <div
                  className={cn(
                    "relative w-full flex-shrink-0 overflow-hidden",
                    imgHeightClass,
                    data.grayscale && "grayscale transition-all duration-300 hover:grayscale-0"
                  )}
                >
                  {item.imageUrl?.trim() ? (
                    <Image
                      src={item.imageUrl.trim()}
                      alt={item.altText?.trim() || item.partnerLabel?.trim() || "Sponsor"}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="h-full min-h-[2rem] w-full bg-white/5" aria-hidden />
                  )}
                </div>
                {item.partnerLabel?.trim() && (
                  <p
                    className={cn(
                      "mt-2 text-xs font-medium uppercase tracking-wide text-gray-500",
                      data.alignment === "center" && "text-center",
                      data.alignment === "right" && "text-right"
                    )}
                  >
                    {item.partnerLabel.trim()}
                  </p>
                )}
              </>
            );
            const wrapperClass = cn(
              "flex flex-col",
              data.alignment === "center" && "items-center",
              data.alignment === "right" && "items-end"
            );
            if (item.linkUrl?.trim()) {
              return (
                <a
                  key={item.id}
                  href={item.linkUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("group block", wrapperClass)}
                >
                  {content}
                </a>
              );
            }
            return (
              <div key={item.id} className={wrapperClass}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
