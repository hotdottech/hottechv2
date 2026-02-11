"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { NewsletterForm } from "./NewsletterForm";

type NewsletterContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const NewsletterContext = createContext<NewsletterContextValue | null>(null);

export function useNewsletter() {
  const ctx = useContext(NewsletterContext);
  if (!ctx) {
    throw new Error("useNewsletter must be used within NewsletterProvider");
  }
  return ctx;
}

export function NewsletterProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const value: NewsletterContextValue = { isOpen, openModal, closeModal };

  return (
    <NewsletterContext.Provider value={value}>
      {children}
      <SubscribeModal />
    </NewsletterContext.Provider>
  );
}

function SubscribeModal() {
  const { isOpen, closeModal } = useNewsletter();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-modal-title"
    >
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-hot-black p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="subscribe-modal-title"
          className="font-serif text-2xl font-semibold text-hot-white"
        >
          Join House of Tech
        </h2>
        <p className="mt-2 font-sans text-gray-400">
          Get the latest reviews and tech news delivered weekly.
        </p>
        <div className="mt-6">
          <NewsletterForm
            source="nav_modal"
            tags={["newsletter", "modal"]}
            variant="stack"
          />
        </div>
        <button
          type="button"
          onClick={closeModal}
          className="mt-4 font-sans text-sm text-gray-400 hover:text-hot-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
