"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--hot-black, #0a0a0a)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        },
      }}
    />
  );
}
