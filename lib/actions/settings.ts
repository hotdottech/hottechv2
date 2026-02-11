"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type NavMenuItem = { label: string; url: string; type?: string };

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
