import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { NewsletterProvider } from "@/components/newsletter/SubscribeModal";
import { AdminDashboardShortcut } from "@/components/admin/AdminDashboardShortcut";
import { Toaster } from "@/components/ui/Toaster";
import { getSiteSettings } from "@/lib/data";
import { getBaseUrl } from "@/lib/url";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: "House of Tech",
    description: "News, reviews, and insights from House of Tech",
    templateType: "page",
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const settings = await getSiteSettings();
  const siteName = (settings?.seo_title ?? "House of Tech").trim() || "House of Tech";
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", url: `${baseUrl}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${geist.variable} antialiased`}
        suppressHydrationWarning
      >
        <JsonLd data={webSiteSchema} />
        <NewsletterProvider>
          {children}
          <AdminDashboardShortcut />
          <Toaster />
        </NewsletterProvider>
      </body>
    </html>
  );
}
