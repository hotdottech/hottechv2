import {
  Twitter,
  Youtube,
  Instagram,
  MessageCircle,
  Linkedin,
  Mail,
} from "lucide-react";
import { CardBase } from "@/components/ui/card-base";

const platforms = [
  {
    icon: Twitter,
    title: "Tech Insights & Rants",
    description: "50k+ Followers",
    href: "https://x.com/nirave",
  },
  {
    icon: Youtube,
    title: "House of Technology",
    description: "Deep Dives & Reviews",
    href: "https://youtube.com/@houseoftech",
  },
  {
    icon: Instagram,
    title: "Behind the Scenes",
    description: "Visual Stories",
    href: "https://instagram.com/nirave",
  },
  {
    icon: MessageCircle,
    title: "Quick Takes",
    description: "Community",
    href: "https://threads.net/@nirave",
  },
  {
    icon: Linkedin,
    title: "Professional Updates",
    description: "Industry News",
    href: "https://linkedin.com/in/nirave",
  },
  {
    icon: Mail,
    title: "Weekly Digest",
    description: "The best of tech",
    href: "#",
  },
] as const;

export function SocialPresence() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-hot-white">
          Social Presence
        </h2>
        <p className="mt-2 font-sans text-gray-400">
          Connect with me across all platforms.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map(({ icon: Icon, title, description, href }) => (
          <CardBase key={title} href={href} className="p-5">
            <span className="inline-flex text-hot-white/80">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-3 font-sans font-bold text-hot-white">
              {title}
            </h3>
            <p className="mt-1 font-sans text-sm text-gray-400">
              {description}
            </p>
          </CardBase>
        ))}
      </div>
    </section>
  );
}
