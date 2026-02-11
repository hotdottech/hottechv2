export interface FeedItem {
  id: string;
  title: string;
  excerpt?: string;
  date: string; // ISO format
  type: "post" | "video" | "external-article" | "social";
  source: "internal" | "external";
  url: string;
  image?: string; // optional URL
  publisher?: string; // e.g. "Forbes", "YouTube"
}

export interface SiteSettingsCta {
  type: string;
  label: string;
  url: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  site_description: string | null;
  logo_url: string | null;
  headshot_url: string | null;
  show_logo: boolean;
  navigation_menu: unknown;
  cta_settings: SiteSettingsCta;
  social_links: unknown;
  updated_at: string;
}
