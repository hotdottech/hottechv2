"use client";

import { motion } from "framer-motion";

const ease = "easeInOut" as const;

export function FluidBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-hot-black"
      aria-hidden
    >
      {/* Orb 1: Hot Red / Pink */}
      <motion.div
        className="absolute h-[800px] w-[800px] rounded-full bg-hot-red/20 blur-[120px]"
        animate={{
          x: [0, 120, -80, 40, 0],
          y: [0, -60, 90, -30, 0],
          scale: [1, 1.15, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "mirror",
          ease,
        }}
        style={{ left: "10%", top: "20%" }}
      />
      {/* Orb 2: Deep Blue / Purple */}
      <motion.div
        className="absolute h-[800px] w-[800px] rounded-full bg-blue-900/30 blur-[120px]"
        animate={{
          x: [0, -100, 60, -40, 0],
          y: [0, 70, -50, 30, 0],
          scale: [1, 0.95, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "mirror",
          ease,
        }}
        style={{ right: "5%", top: "40%" }}
      />
      {/* Orb 3: Teal / Cyan */}
      <motion.div
        className="absolute h-[800px] w-[800px] rounded-full bg-emerald-900/20 blur-[120px]"
        animate={{
          x: [0, 80, -120, 50, 0],
          y: [0, -80, 40, -60, 0],
          scale: [1, 1.1, 0.85, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: "mirror",
          ease,
        }}
        style={{ left: "30%", bottom: "10%" }}
      />
    </div>
  );
}
