"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShowcaseGridItem = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge?: string;
  badge_color?: string;
  hide_title?: boolean;
  link?: string;
  description?: string;
  buttonText?: string;
  buttonColor?: string;
};

const BADGE_COLOR_MAP: Record<string, string> = {
  gray: "bg-gray-500 text-white",
  gold: "bg-yellow-500 text-black",
  silver: "bg-slate-300 text-black",
  bronze: "bg-orange-700 text-white",
  red: "bg-red-600 text-white",
  blue: "bg-blue-600 text-white",
  green: "bg-green-600 text-white",
  black: "bg-black text-white",
};

const BUTTON_COLOR_MAP: Record<string, string> = {
  gray: "bg-gray-500 hover:bg-gray-600 text-white",
  gold: "bg-yellow-500 hover:bg-yellow-600 text-black",
  red: "bg-red-600 hover:bg-red-700 text-white",
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  green: "bg-green-600 hover:bg-green-700 text-white",
  black: "bg-black hover:bg-gray-900 text-white",
};

const READ_MORE_CHARS = 120;

type ShowcaseGridProps = {
  type: "people" | "products";
  items: ShowcaseGridItem[];
  displayOptions?: Record<string, unknown>;
};

function normalizeItems(raw: unknown[]): ShowcaseGridItem[] {
  return raw
    .filter((x): x is ShowcaseGridItem => {
      if (x == null || typeof x !== "object") return false;
      const o = x as Record<string, unknown>;
      return (
        typeof o.id === "string" &&
        typeof o.title === "string" &&
        typeof o.image === "string"
      );
    })
    .map((x) => {
      const o = x as Record<string, unknown>;
      return {
        id: x.id,
        image: String(x.image),
        title: String(x.title),
        subtitle: typeof x.subtitle === "string" ? x.subtitle : "",
        badge:
          typeof o.badge === "string" && o.badge.trim() ? o.badge : undefined,
        badge_color:
          typeof o.badge_color === "string" ? o.badge_color : "gray",
        hide_title: o.hide_title === true,
        link: typeof o.link === "string" && o.link.trim() ? o.link : undefined,
        description:
          typeof o.description === "string" && o.description.trim()
            ? o.description
            : undefined,
        buttonText:
          typeof o.buttonText === "string" && o.buttonText.trim()
            ? o.buttonText
            : undefined,
        buttonColor:
          typeof o.buttonColor === "string" ? o.buttonColor : undefined,
      };
    });
}

const GRID_COLS_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
};

type ShowcaseCardProps = {
  item: ShowcaseGridItem;
  columns: number;
  type: "people" | "products";
  imageShape: "circle" | "square";
  isDense: boolean;
};

function ShowcaseCard({
  item,
  columns,
  type,
  imageShape,
  isDense,
}: ShowcaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const badgeClasses =
    BADGE_COLOR_MAP[item.badge_color ?? "gray"] ?? BADGE_COLOR_MAP.gray;
  const buttonClasses =
    BUTTON_COLOR_MAP[item.buttonColor ?? "gray"] ?? BUTTON_COLOR_MAP.gray;
  const buttonLabel = item.buttonText?.trim() || "View Deal";
  const isList = columns === 1;
  const isVertical = columns >= 2;
  const description = item.description?.trim() ?? "";
  const showReadMore =
    description.length > READ_MORE_CHARS || description.split(/\s+/).length > 20;
  const lineClampClass =
    columns === 1
      ? "line-clamp-[8]"
      : columns === 2
        ? "line-clamp-5"
        : "line-clamp-3";

  const descriptionBlock = (
    <>
      {description && (
        <p
          className={cn(
            "font-sans text-gray-500 whitespace-pre-line",
            isDense ? "text-xs" : "text-sm",
            !isExpanded && showReadMore && lineClampClass
          )}
        >
          {description}
        </p>
      )}
      {showReadMore && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded((v) => !v);
          }}
          className="mt-1 font-sans text-sm font-medium text-hot-white underline hover:no-underline"
        >
          {isExpanded ? "Read less" : "Read More"}
        </button>
      )}
    </>
  );

  const buttonEl = item.link ? (
    <span
      className={cn(
        "mt-3 inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-2 font-sans text-sm font-medium transition-colors",
        buttonClasses,
        isVertical && "mx-auto"
      )}
    >
      {buttonLabel}
      <ExternalLink className="h-3.5 w-3.5" />
    </span>
  ) : null;

  const contentBlock = (cardIsLink: boolean) => (
    <div
      className={cn(
        "flex flex-1 flex-col",
        isList && "text-left py-4 md:justify-center",
        isVertical && "text-center",
        columns === 2 ? "mt-2" : isVertical && "mt-4"
      )}
    >
      {!item.hide_title && (
        <h3
          className={cn(
            "font-serif font-semibold text-hot-white",
            isDense ? "text-lg" : "text-xl"
          )}
        >
          {item.title}
        </h3>
      )}
      {item.subtitle && (
        <p
          className={cn(
            "mt-1 font-sans text-gray-400",
            isDense ? "text-xs" : "text-sm"
          )}
        >
          {item.subtitle}
        </p>
      )}
      {item.badge && (
        <span
          className={cn(
            "inline-block rounded-full px-3 py-0.5 font-sans text-xs font-medium",
            badgeClasses,
            isVertical && "mt-2"
          )}
        >
          {item.badge}
        </span>
      )}
      {description && (
        <div className={isList ? "mt-2" : "mt-3"}>{descriptionBlock}</div>
      )}
      {item.link &&
        (cardIsLink ? (
          buttonEl
        ) : (
          <Link
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-3 inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-2 font-sans text-sm font-medium transition-colors",
              buttonClasses,
              isVertical && "mx-auto"
            )}
          >
            {buttonLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ))}
    </div>
  );

  if (type === "people") {
    const imageBlock = (
      <div
        className={cn(
          "relative overflow-hidden border-2 border-white/20 rounded-lg object-cover shrink-0",
          isList
            ? "w-full md:w-1/3 aspect-video md:aspect-square"
            : "w-full aspect-video"
        )}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
            sizes={isList ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          />
        ) : (
          <div className="h-full w-full bg-white/10" />
        )}
      </div>
    );

    const cardPadding = isDense ? "p-4" : "p-6";
    const className = cn(
      "flex rounded-2xl border border-white/10 bg-hot-black/40 shadow-lg transition-colors hover:border-white/20",
      isList
        ? "flex-col md:flex-row gap-8 text-left"
        : "flex flex-col h-full gap-4 items-center text-center",
      cardPadding
    );

    if (item.link) {
      return (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {imageBlock}
          {contentBlock(true)}
        </a>
      );
    }
    return (
      <article className={className}>
        {imageBlock}
        {contentBlock(false)}
      </article>
    );
  }

  // Products
  const productCardPadding = isDense ? "p-3" : "p-4";
  const productTitleClass = isDense
    ? "font-serif text-base font-semibold"
    : "font-serif text-lg font-semibold";

  const productImageBlock = (
    <div
      className={cn(
        "relative overflow-hidden bg-hot-gray rounded-lg shrink-0",
        isList
          ? "w-full md:w-1/3 aspect-video md:aspect-square"
          : "w-full aspect-video"
      )}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes={isList ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        />
      ) : (
        <div className="h-full w-full bg-white/5" />
      )}
      {item.badge && (
        <span
          className={cn(
            "absolute right-3 top-3 rounded-md px-2.5 py-1 font-sans text-xs font-semibold shadow",
            badgeClasses
          )}
        >
          {item.badge}
        </span>
      )}
    </div>
  );

  const productContentBlock = (
    <div
      className={cn(
        "flex flex-1 flex-col",
        isList && "justify-center py-4",
        columns === 2 ? "mt-2" : isVertical && "mt-4",
        productCardPadding
      )}
    >
      {!item.hide_title && (
        <h3 className={cn(productTitleClass, "text-hot-white")}>
          {item.title}
        </h3>
      )}
      {item.subtitle && (
        <p
          className={cn(
            "mt-0.5 font-sans text-gray-400",
            isDense ? "text-xs" : "text-sm"
          )}
        >
          {item.subtitle}
        </p>
      )}
      {description && (
        <div className="mt-2">{descriptionBlock}</div>
      )}
      {item.link && (
        <Link
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-3 inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-2 font-sans text-sm font-medium transition-colors",
            buttonClasses
          )}
        >
          {buttonLabel}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-xl border border-white/10 bg-hot-black/40 shadow-lg transition-shadow hover:shadow-xl",
        isList
          ? "flex-col md:flex-row gap-8"
          : "flex flex-col h-full gap-4"
      )}
    >
      {productImageBlock}
      {productContentBlock}
    </article>
  );
}

export function ShowcaseGrid({
  type,
  items: rawItems,
  displayOptions,
}: ShowcaseGridProps) {
  const items = normalizeItems(Array.isArray(rawItems) ? rawItems : []);
  if (items.length === 0) return null;

  const hideSectionTitle = displayOptions?.hide_showcase_title === true;
  const gridColumns = Math.min(
    5,
    Math.max(1, Number(displayOptions?.grid_columns) || 3)
  );
  const imageShape =
    (displayOptions?.image_shape as string) === "square" ? "square" : "circle";
  const gridClass = cn(
    "grid gap-6 w-full",
    GRID_COLS_CLASS[gridColumns] ?? GRID_COLS_CLASS[3]
  );
  const isDense = gridColumns >= 4;
  const widthClass =
    gridColumns >= 5
      ? "max-w-[115rem]"
      : gridColumns === 4
        ? "max-w-[90rem]"
        : "max-w-5xl";
  const sectionClass = cn(
    "mx-auto w-full px-4 py-12 sm:px-6 lg:px-8",
    widthClass
  );
  const breakoutWrapperClass =
    "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-hidden";

  const sectionTitle =
    type === "people" ? "Hall of Fame" : "The Lineup";

  return (
    <div className={breakoutWrapperClass}>
      <section
        className={sectionClass}
        aria-label={sectionTitle}
      >
        {!hideSectionTitle && (
          <h2 className="mb-8 text-center font-serif text-2xl font-semibold text-hot-white md:text-3xl">
            {sectionTitle}
          </h2>
        )}
        <div className={gridClass}>
          {items.map((item) => (
            <ShowcaseCard
              key={item.id}
              item={item}
              columns={gridColumns}
              type={type}
              imageShape={imageShape}
              isDense={isDense}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
