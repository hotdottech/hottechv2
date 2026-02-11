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

type ShowcaseGridProps = {
  type: "people" | "products";
  items: ShowcaseGridItem[];
  /** Post display options; hide_showcase_title hides the section heading. */
  displayOptions?: Record<string, unknown>;
};

function normalizeItems(raw: unknown[]): ShowcaseGridItem[] {
  return raw.filter((x): x is ShowcaseGridItem => {
    if (x == null || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return (
      typeof o.id === "string" &&
      typeof o.title === "string" &&
      typeof o.image === "string"
    );
  }).map((x) => {
    const o = x as Record<string, unknown>;
    return {
      id: x.id,
      image: String(x.image),
      title: String(x.title),
      subtitle: typeof x.subtitle === "string" ? x.subtitle : "",
      badge: typeof o.badge === "string" && o.badge.trim() ? o.badge : undefined,
      badge_color: typeof o.badge_color === "string" ? o.badge_color : "gray",
      hide_title: o.hide_title === true,
      link: typeof o.link === "string" && o.link.trim() ? o.link : undefined,
      description: typeof o.description === "string" && o.description.trim() ? o.description : undefined,
    };
  });
}

const GRID_COLS_CLASS: Record<number, string> = {
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
};

export function ShowcaseGrid({ type, items: rawItems, displayOptions }: ShowcaseGridProps) {
  const items = normalizeItems(Array.isArray(rawItems) ? rawItems : []);
  if (items.length === 0) return null;

  const hideSectionTitle = displayOptions?.hide_showcase_title === true;
  const gridColumns = Math.min(5, Math.max(3, Number(displayOptions?.grid_columns) || 3));
  const imageShape = (displayOptions?.image_shape as string) === "square" ? "square" : "circle";
  const gridClass = `grid grid-cols-1 gap-6 ${GRID_COLS_CLASS[gridColumns] ?? GRID_COLS_CLASS[3]}`;
  const isDense = gridColumns >= 4;
  const widthClass =
    gridColumns >= 5
      ? "max-w-[115rem]"
      : gridColumns === 4
        ? "max-w-[90rem]"
        : "max-w-5xl";
  const sectionClass = cn("mx-auto px-4 py-12 sm:px-6 lg:px-8", widthClass);
  const breakoutWrapperClass =
    "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-hidden";

  if (type === "people") {
    const imageRoundClass = imageShape === "square" ? "rounded-xl" : "rounded-full";
    return (
      <div className={breakoutWrapperClass}>
        <section className={sectionClass} aria-label="Hall of Fame">
          {!hideSectionTitle && (
            <h2 className="font-serif text-2xl font-semibold text-hot-white mb-8 text-center md:text-3xl">
              Hall of Fame
            </h2>
          )}
          <div className={gridClass}>
          {items.map((item) => {
            const badgeClasses = BADGE_COLOR_MAP[item.badge_color ?? "gray"] ?? BADGE_COLOR_MAP.gray;
            const cardContent = (
              <>
                <div
                  className={cn(
                    "relative mx-auto mb-5 aspect-square overflow-hidden border-2 border-white/20",
                    imageRoundClass,
                    isDense
                      ? "w-28 min-w-28 min-h-28"
                      : "w-32 min-w-32 min-h-32 sm:w-40 sm:min-w-40 sm:min-h-40"
                  )}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, 160px"
                    />
                  ) : (
                    <div className="h-full w-full bg-white/10" />
                  )}
                </div>
                {!item.hide_title && (
                  <h3 className={`font-serif font-semibold text-hot-white ${isDense ? "text-lg" : "text-xl"}`}>
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className={`mt-1 font-sans text-gray-400 ${isDense ? "text-xs" : "text-sm"}`}>
                    {item.subtitle}
                  </p>
                )}
                {item.badge && (
                  <span className={`mt-2 inline-block rounded-full px-3 py-0.5 font-sans text-xs font-medium ${badgeClasses}`}>
                    {item.badge}
                  </span>
                )}
                {item.description && (
                  <p className={`mt-3 font-sans text-gray-500 line-clamp-3 ${isDense ? "text-xs" : "text-sm"}`}>
                    {item.description}
                  </p>
                )}
              </>
            );
            const cardPadding = isDense ? "p-4" : "p-6";
            const className = `flex flex-col items-center rounded-2xl border border-white/10 bg-hot-black/40 ${cardPadding} text-center shadow-lg transition-colors hover:border-white/20`;
            if (item.link) {
              return (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {cardContent}
                </a>
              );
            }
            return (
              <article key={item.id} className={className}>
                {cardContent}
              </article>
            );
          })}
          </div>
        </section>
      </div>
    );
  }

  // Products: Tech Grid — landscape cards, badge overlays, Buy/View
  const productCardPadding = isDense ? "p-3" : "p-4";
  const productTitleClass = isDense ? "font-serif text-base font-semibold" : "font-serif text-lg font-semibold";
  return (
    <div className={breakoutWrapperClass}>
      <section className={sectionClass} aria-label="Showcase">
        {!hideSectionTitle && (
          <h2 className="font-serif text-2xl font-semibold text-hot-white mb-8 text-center md:text-3xl">
            The Lineup
          </h2>
        )}
        <div className={gridClass}>
        {items.map((item) => {
          const badgeClasses = BADGE_COLOR_MAP[item.badge_color ?? "gray"] ?? BADGE_COLOR_MAP.gray;
          return (
            <article
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-hot-black/40 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-hot-gray">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}
                {item.badge && (
                  <span className={`absolute right-3 top-3 rounded-md px-2.5 py-1 font-sans text-xs font-semibold shadow ${badgeClasses}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div className={`flex flex-1 flex-col ${productCardPadding}`}>
                {!item.hide_title && (
                  <h3 className={`${productTitleClass} text-hot-white`}>
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className={`mt-0.5 font-sans text-gray-400 ${isDense ? "text-xs" : "text-sm"}`}>
                    {item.subtitle}
                  </p>
                )}
                {item.description && (
                  <p className={`mt-2 font-sans text-gray-500 line-clamp-2 ${isDense ? "text-xs" : "text-sm"}`}>
                    {item.description}
                  </p>
                )}
                {item.link && (
                  <Link
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-2 font-sans text-sm font-medium text-hot-white transition-colors hover:bg-white/10"
                  >
                    Learn More
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
        </div>
      </section>
    </div>
  );
}
