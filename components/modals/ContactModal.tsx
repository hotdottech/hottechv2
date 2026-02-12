"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

const TOPICS = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Sponsorship / Advertising", label: "Sponsorship / Advertising" },
  { value: "Editorial / News Tip", label: "Editorial / News Tip" },
  { value: "Report a Bug", label: "Report a Bug" },
] as const;

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0].value);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const reset = useCallback(() => {
    setName("");
    setEmail("");
    setTopic(TOPICS[0].value);
    setMessage("");
    setIsSuccess(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  }, [isSubmitting, reset, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, topic, message }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }
        setIsSuccess(true);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, email, topic, message]
  );

  if (!mounted || !isOpen) return null;

  const modalJsx = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="contact-modal-title"
          className="font-serif text-2xl font-semibold text-hot-white"
        >
          {isSuccess ? "Message sent" : "Get in Touch"}
        </h2>
        <p className="mt-2 font-sans text-gray-400">
          {isSuccess
            ? "We'll get back to you soon."
            : "Have a question or want to work with us?"}
        </p>
        <div className="mt-6">
          {isSuccess ? null : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3"
            >
              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="h-12 w-full flex-1 rounded-md border border-white/10 bg-white/5 px-4 font-sans text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-0"
                aria-label="Name"
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-12 w-full flex-1 rounded-md border border-white/10 bg-white/5 px-4 font-sans text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-0"
                aria-label="Email"
              />
              <select
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isSubmitting}
                className="h-12 w-full flex-1 rounded-md border border-white/10 bg-white/5 px-4 font-sans text-hot-white focus:border-white/30 focus:outline-none focus:ring-0"
                aria-label="Topic"
              >
                {TOPICS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <textarea
                name="message"
                placeholder="Your message..."
                required
                rows={4}
                minLength={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px] w-full resize-y rounded-md border border-white/10 bg-white/5 px-4 py-3 font-sans text-hot-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-0"
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 shrink-0 rounded-md bg-white px-6 font-sans text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-70"
              >
                {isSubmitting ? "Sending…" : "Send Message"}
              </button>
              {error && (
                <p className="font-sans text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="mt-4 font-sans text-sm text-gray-400 hover:text-hot-white"
        >
          Close
        </button>
      </div>
    </div>
  );

  return createPortal(modalJsx, document.body);
}
