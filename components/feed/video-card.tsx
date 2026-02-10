import Image from "next/image";
import { Play } from "lucide-react";
import { format } from "date-fns";
import { CardBase } from "@/components/ui/card-base";
import type { FeedItem } from "@/lib/types";

type VideoCardProps = {
  item: FeedItem;
};

export function VideoCard({ item }: VideoCardProps) {
  return (
    <CardBase
      href={item.url}
      className="group bg-hot-gray/80"
    >
      {/* Thumbnail with overlay and Play button */}
      <div className="relative aspect-video w-full overflow-hidden bg-hot-black">
        {item.image && (
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        )}
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-hot-red text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="h-7 w-7 fill-current pl-1" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4">
        <h3 className="font-serif text-xl font-medium text-hot-white">
          {item.title}
        </h3>
        <div className="mt-2 font-sans text-xs text-hot-white/60">
          {format(new Date(item.date), "MMM d, yyyy")}
          {item.publisher ? ` · ${item.publisher}` : ""}
        </div>
      </div>
    </CardBase>
  );
}
