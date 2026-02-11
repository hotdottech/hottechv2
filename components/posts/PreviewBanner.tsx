export function PreviewBanner() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/20 bg-amber-400 px-4 py-2 text-center font-sans text-sm font-semibold text-black shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]"
      role="status"
      aria-live="polite"
    >
      PREVIEW MODE: Draft
    </div>
  );
}
