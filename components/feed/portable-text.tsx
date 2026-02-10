import Image from "next/image";
import { PortableText as BasePortableText } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/lib/sanity";

const components = {
  types: {
    image: ({
      value,
    }: {
      value?: { asset?: unknown; alt?: string; caption?: string };
    }) => {
      if (!value?.asset) return null;
      const url = urlFor(value.asset).width(1200).url();
      return (
        <figure className="my-8 w-full overflow-hidden rounded-lg">
          <div className="relative aspect-video w-full">
            <Image
              src={url}
              alt={value.alt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 font-sans text-sm text-gray-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="font-serif text-3xl font-bold leading-tight text-hot-white mt-12 mb-6 md:text-4xl">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-serif text-2xl font-bold text-hot-white mt-10 mb-5 md:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-serif text-2xl font-bold text-hot-white mt-10 mb-5 md:text-3xl">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="font-serif text-xl font-bold text-hot-white mt-8 mb-4">
        {children}
      </h4>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="font-sans text-lg leading-relaxed text-gray-300 mb-6">
        {children}
      </p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-hot-red pl-6 italic text-xl text-gray-400 my-8">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children?: React.ReactNode;
      value?: { href?: string };
    }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-hot-red decoration-2 underline-offset-4 transition-colors hover:underline"
      >
        {children}
      </a>
    ),
  },
};

type CustomPortableTextProps = {
  value: PortableTextBlock[] | null | undefined;
};

export function CustomPortableText({ value }: CustomPortableTextProps) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return null;
  }
  return (
    <BasePortableText value={value} components={components} />
  );
}
