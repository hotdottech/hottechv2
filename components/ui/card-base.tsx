"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

const cardClasses =
  "block bg-hot-gray/50 border border-white/5 rounded-lg overflow-hidden transition-shadow duration-300 hover:border-white/20 shadow-lg hover:shadow-2xl";

const hoverMotion = {
  whileHover: { y: -5 },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

type CardBaseProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
};

const MotionLink = motion(Link);

export function CardBase({ children, className, href }: CardBaseProps) {
  const mergedClassName = cn(
    cardClasses,
    "group relative overflow-hidden",
    className
  );
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const spotlightStyle = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent 80%)`;

  const spotlightOverlay = (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: spotlightStyle }}
      aria-hidden
    />
  );

  if (href) {
    const isExternal =
      href.startsWith("http://") || href.startsWith("https://");
    if (isExternal) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={mergedClassName}
          onMouseMove={handleMouseMove}
          {...hoverMotion}
        >
          {spotlightOverlay}
          {children}
        </motion.a>
      );
    }
    return (
      <MotionLink
        href={href}
        className={mergedClassName}
        onMouseMove={handleMouseMove}
        {...hoverMotion}
      >
        {spotlightOverlay}
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.div
      className={mergedClassName}
      onMouseMove={handleMouseMove}
      {...hoverMotion}
    >
      {spotlightOverlay}
      {children}
    </motion.div>
  );
}
