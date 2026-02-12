/** Single sponsor/partner logo and optional link + label. */
export type SponsorItem = {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  partnerLabel?: string;
};

/** Sponsor block configuration (title, layout, list of items). */
export type SponsorBlockData = {
  title?: string;
  titleTag: "h2" | "h3" | "h4" | "p";
  titleColor: "default" | "primary" | "muted" | "gold" | "red";
  items: SponsorItem[];
  columns: "1" | "2" | "3" | "4" | "5" | "6";
  size: "sm" | "md" | "lg" | "xl";
  alignment: "left" | "center" | "right";
  grayscale: boolean;
};

export const DEFAULT_SPONSOR_BLOCK_DATA: SponsorBlockData = {
  title: "",
  titleTag: "h3",
  titleColor: "default",
  items: [],
  columns: "3",
  size: "md",
  alignment: "center",
  grayscale: false,
};
