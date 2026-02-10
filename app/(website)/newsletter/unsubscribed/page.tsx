import Link from "next/link";

export default function UnsubscribedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-hot-white md:text-4xl">
        You have been unsubscribed.
      </h1>
      <p className="mt-4 font-sans text-lg text-gray-400">
        We&apos;re sorry to see you go. You can always resubscribe on the homepage.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-hot-white px-6 py-3 font-sans font-medium text-hot-black transition-colors hover:bg-hot-white/90"
      >
        Back to Home
      </Link>
    </div>
  );
}
