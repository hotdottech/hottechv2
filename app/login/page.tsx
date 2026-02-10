import Link from "next/link";
import { LoginForm } from "./login-form";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hot-black px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-hot-white">
            Hot Tech Admin
          </h1>
          <p className="mt-2 font-sans text-sm text-gray-400">
            Sign in to continue
          </p>
        </div>

        <LoginForm action={login} next={next ?? undefined} />

        <p className="text-center font-sans text-xs text-gray-500">
          <Link href="/" className="text-hot-white/80 hover:text-hot-white">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
