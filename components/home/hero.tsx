"use client";

import { motion } from "framer-motion";
import { NewsletterInput } from "./newsletter-input";

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Headline + subtext + social proof */}
        <div className="flex flex-col">
          <motion.h1
            className="font-serif text-5xl font-medium text-hot-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Nirave Gondhia.
          </motion.h1>
          <motion.p
            className="mt-3 font-sans text-xl text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            Journalist, Host & Creator.
          </motion.p>
          <motion.p
            className="mt-6 font-sans text-sm text-hot-white/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            Seen in: Forbes, TechRadar, Android Central
          </motion.p>
          <NewsletterInput />
        </div>

        {/* Right: Portrait placeholder - fade + scale */}
        <motion.div
          className="aspect-square w-64 shrink-0 rounded-full bg-hot-gray"
          aria-hidden
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </section>
  );
}
