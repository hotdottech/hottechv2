import {
  Twitter,
  Youtube,
  Instagram,
  MessageCircle,
  Linkedin,
} from "lucide-react";
import { CardBase } from "@/components/ui/card-base";

const platforms = [
  {
    platform: "Twitter",
    icon: Twitter,
    iconClass: "text-sky-500",
    handle: "@nirave",
    description: "Tech insights, F1, and MUFC thoughts.",
    href: "https://x.com/nirave",
  },
  {
    platform: "YouTube",
    icon: Youtube,
    iconClass: "text-red-500",
    handle: "@hotdottech",
    description: "House of Technology - Deep dives into consumer tech.",
    href: "https://youtube.com/@houseoftech",
  },
  {
    platform: "Instagram",
    icon: Instagram,
    iconClass: "text-pink-500",
    handle: "@hotdottech",
    description: "Visual tech reviews and behind the scenes.",
    href: "https://instagram.com/hotdottech",
  },
  {
    platform: "Threads",
    icon: MessageCircle,
    iconClass: "text-white",
    handle: "@hotdottech",
    description: "Quick tech takes and community discussions.",
    href: "https://threads.net/@hotdottech",
  },
  {
    platform: "Threads",
    icon: MessageCircle,
    iconClass: "text-white",
    handle: "@niraveg",
    description: "Personal thoughts and daily musings.",
    href: "https://www.threads.net/@niraveg",
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    iconClass: "text-[#0A66C2]",
    handle: "Nirave Gondhia",
    description: "Professional updates and industry analysis.",
    href: "https://www.linkedin.com/in/niravegondhia",
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    iconClass: "text-[#0A66C2]",
    handle: "House of Tech",
    description: "Company news and team updates.",
    href: "https://www.linkedin.com/company/hotdottech/",
  },
  {
    platform: "Instagram",
    icon: Instagram,
    iconClass: "text-pink-500",
    handle: "@techmeetstravel",
    description: "Where technology meets the journey.",
    href: "https://instagram.com/techmeetstravel",
  },
  {
    platform: "Threads",
    icon: MessageCircle,
    iconClass: "text-white",
    handle: "@techmeetstravel",
    description: "Travel stories through a tech lens.",
    href: "https://threads.net/@techmeetstravel",
  },
];

export function SocialPresence() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-hot-white">
          Social Presence
        </h2>
        <p className="mt-2 font-sans text-gray-400">
          Connect with us across all these platforms.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map(({ platform, icon: Icon, iconClass, handle, description, href }, i) => (
          <CardBase
            key={`${platform}-${handle}-${i}`}
            href={href}
            className="border-white/10 bg-white/5 p-5 hover:border-white/20"
          >
            <span className={`inline-flex ${iconClass}`} aria-hidden>
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-3 text-lg font-bold leading-none text-white">
              {platform}
            </h3>
            <p className="font-mono text-sm text-hot-blue mt-1 mb-3">
              {handle}
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              {description}
            </p>
          </CardBase>
        ))}
      </div>
    </section>
  );
}
