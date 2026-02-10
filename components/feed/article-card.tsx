import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { CardBase } from "@/components/ui/card-base";
import type { FeedItem } from "@/lib/types";

type ArticleCardProps = {
  item: FeedItem;
};

export function ArticleCard({ item }: ArticleCardProps) {
  const isExternal = item.source === "external";
  const displayPublisher = item.publisher ?? (isExternal ? "External" : "Hot Tech");

  return (
    <CardBase href={item.url} className="flex flex-col">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-hot-gray">
        {item.image && (
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        )}
        {isExternal && (
          <span
            className="absolute right-3 top-3 rounded-full bg-hot-black/60 p-1.5 text-hot-white backdrop-blur-sm"
            aria-hidden
          >
            <ExternalLink className="h-4 w-4" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-xl font-medium text-hot-white">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="mt-2 font-sans text-sm text-gray-400 line-clamp-2">
            {item.excerpt}
          </p>
        )}
        <div className="mt-auto pt-4 font-sans text-xs text-hot-white/60">
          {format(new Date(item.date), "MMM d, yyyy")} · {displayPublisher}
        </div>
      </div>
    </CardBase>
  );
}
