/**
 * Returns the site's base URL with protocol, no trailing slash.
 * Priority: NEXT_PUBLIC_BASE_URL → NEXT_PUBLIC_VERCEL_URL → VERCEL_URL → localhost.
 */
export function getBaseUrl(): string {
  const withProtocol = (raw: string): string => {
    const trimmed = raw.replace(/\/+$/, "");
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  };

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return withProtocol(process.env.NEXT_PUBLIC_BASE_URL);
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return withProtocol(process.env.NEXT_PUBLIC_VERCEL_URL);
  }
  if (process.env.VERCEL_URL) {
    return withProtocol(process.env.VERCEL_URL);
  }
  return "http://localhost:3000";
}
