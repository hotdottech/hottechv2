import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

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

export function ShowcaseGrid({ type, items: rawItems, displayOptions }: ShowcaseGridProps) {
  const items = normalizeItems(Array.isArray(rawItems) ? rawItems : []);
  if (items.length === 0) return null;

  const hideSectionTitle = displayOptions?.hide_showcase_title === true;

  if (type === "people") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Hall of Fame">
        {!hideSectionTitle && (
          <h2 className="font-serif text-2xl font-semibold text-hot-white mb-8 text-center md:text-3xl">
            Hall of Fame
          </h2>
        )}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const badgeClasses = BADGE_COLOR_MAP[item.badge_color ?? "gray"] ?? BADGE_COLOR_MAP.gray;
            const cardContent = (
              <>
                <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-white/20">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="h-full w-full bg-white/10" />
                  )}
                </div>
                {!item.hide_title && (
                  <h3 className="font-serif text-xl font-semibold text-hot-white">
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="mt-1 font-sans text-sm text-gray-400">
                    {item.subtitle}
                  </p>
                )}
                {item.badge && (
                  <span className={`mt-2 inline-block rounded-full px-3 py-0.5 font-sans text-xs font-medium ${badgeClasses}`}>
                    {item.badge}
                  </span>
                )}
                {item.description && (
                  <p className="mt-3 font-sans text-sm text-gray-500 line-clamp-3">
                    {item.description}
                  </p>
                )}
              </>
            );
            const className = "flex flex-col items-center rounded-2xl border border-white/10 bg-hot-black/40 p-6 text-center shadow-lg transition-colors hover:border-white/20";
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
    );
  }

  // Products: Tech Grid — landscape cards, badge overlays, Buy/View
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Showcase">
      {!hideSectionTitle && (
        <h2 className="font-serif text-2xl font-semibold text-hot-white mb-8 text-center md:text-3xl">
          The Lineup
        </h2>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="flex flex-1 flex-col p-4">
                {!item.hide_title && (
                  <h3 className="font-serif text-lg font-semibold text-hot-white">
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="mt-0.5 font-sans text-sm text-gray-400">
                    {item.subtitle}
                  </p>
                )}
                {item.description && (
                  <p className="mt-2 font-sans text-sm text-gray-500 line-clamp-2">
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
  );
}
