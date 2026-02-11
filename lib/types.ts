/** Homepage block: hero, feature_grid, timeline, or smart_feed. */
export type HomepageBlockType = "hero" | "feature_grid" | "timeline" | "smart_feed";

export interface HomepageBlock {
  id: string;
  type: HomepageBlockType;
  enabled: boolean;
  data?: unknown;
}

/** Hero block data (stored in block.data). */
export interface HeroBlockData {
  title?: string;
  subtitle?: string;
  description?: string;
  headshot_url?: string;
  shape?: "circle" | "square";
}

/** Feature grid block data (stored in block.data). */
export interface FeatureGridBlockData {
  sectionTitle?: string;
  postIds?: string[];
}

/** Single slide in the timeline block. */
export interface TimelineSlide {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
}

/** Timeline block data (stored in block.data). */
export interface TimelineBlockData {
  slides?: TimelineSlide[];
}

/** Smart feed block data (stored in block.data). */
export interface SmartFeedBlockData {
  title?: string;
  categoryId?: number | null;
  tagId?: number | null;
  typeId?: number | null;
  limit?: number;
}

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

/** Newsletter subscriber (subscribers table). */
export interface Subscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed" | "bounced";
  created_at: string;
  source?: string;
  preferences?: { segments?: string[] } | null;
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
  homepage_layout?: HomepageBlock[];
  seo_title: string | null;
  seo_description: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  default_og_image: string | null;
  seo_template_post: string | null;
  seo_template_archive: string | null;
  seo_template_page: string | null;
  updated_at: string;
}
