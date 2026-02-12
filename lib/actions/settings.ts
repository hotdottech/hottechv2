"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { HomepageBlock, FooterConfig } from "@/lib/types";

export type NavMenuItem = { label: string; url: string; type?: string };

export async function getHomepageLayout(): Promise<HomepageBlock[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("site_settings")
    .select("homepage_layout")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[getHomepageLayout]", error);
    return [];
  }
  const raw = data?.homepage_layout;
  if (!Array.isArray(raw)) return [];
  return raw as HomepageBlock[];
}

export async function getNavigationMenu(): Promise<NavMenuItem[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("site_settings")
    .select("navigation_menu")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[getNavigationMenu]", error);
    return [];
  }
  const raw = data?.navigation_menu;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is NavMenuItem =>
      item != null &&
      typeof item === "object" &&
      typeof (item as NavMenuItem).label === "string" &&
      typeof (item as NavMenuItem).url === "string"
  );
}

export async function updateNavigation(
  menuItems: NavMenuItem[]
): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await client
    .from("site_settings")
    .update({
      navigation_menu: menuItems,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[updateNavigation]", error);
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/menus");
  return {};
}

export async function updateHomepageLayout(
  layout: HomepageBlock[]
): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  if (!Array.isArray(layout)) {
    return { error: "Layout must be an array." };
  }

  const { error } = await client
    .from("site_settings")
    .update({
      homepage_layout: layout,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[updateHomepageLayout]", error);
    return { error: error.message };
  }

  revalidatePath("/");
  return {};
}

export async function updateSeoSettings(updates: {
  seo_title?: string | null;
  seo_description?: string | null;
  social_twitter?: string | null;
  social_linkedin?: string | null;
  default_og_image?: string | null;
  seo_template_post?: string | null;
  seo_template_archive?: string | null;
  seo_template_page?: string | null;
}): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await client
    .from("site_settings")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[updateSeoSettings]", error);
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidateTag("site-settings");
  return {};
}

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: [[], [], []],
};

export async function getFooterSettings(): Promise<FooterConfig> {
  const client = await createClient();
  const { data, error } = await client
    .from("site_settings")
    .select("footer_config")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[getFooterSettings]", error);
    return DEFAULT_FOOTER_CONFIG;
  }
  const raw = data?.footer_config;
  if (!raw || typeof raw !== "object" || !("columns" in raw) || !Array.isArray((raw as FooterConfig).columns)) {
    return DEFAULT_FOOTER_CONFIG;
  }
  const cols = (raw as FooterConfig).columns;
  return {
    columns: [
      Array.isArray(cols[0]) ? cols[0] : [],
      Array.isArray(cols[1]) ? cols[1] : [],
      Array.isArray(cols[2]) ? cols[2] : [],
    ],
  };
}

export async function updateFooterSettings(
  config: FooterConfig
): Promise<{ error?: string }> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const columns = config?.columns;
  if (!Array.isArray(columns) || columns.length !== 3) {
    return { error: "Footer config must have 3 columns." };
  }

  const { error } = await client
    .from("site_settings")
    .update({
      footer_config: {
        columns: [
          Array.isArray(columns[0]) ? columns[0] : [],
          Array.isArray(columns[1]) ? columns[1] : [],
          Array.isArray(columns[2]) ? columns[2] : [],
        ],
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[updateFooterSettings]", error);
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/footer");
  revalidateTag("site-settings");
  return {};
}
