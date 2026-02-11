"use server";

import { createClient } from "@/utils/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscribeState = { success: boolean; message: string };

export async function subscribe(
  _prevState: SubscribeState | null,
  formData: FormData
): Promise<SubscribeState> {
  const email = (formData.get("email") as string)?.trim()?.toLowerCase() ?? "";
  const source = (formData.get("source") as string)?.trim() || "unknown";
  const tagsRaw = (formData.get("tags") as string)?.trim() || "newsletter";
  const segments = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const uniqueSegments = Array.from(new Set(segments.length ? segments : ["newsletter"]));

  if (!email) {
    return { success: false, message: "Email is required." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const client = await createClient();

  const { data: existing, error: fetchError } = await client
    .from("subscribers")
    .select("id, preferences, source")
    .eq("email", email)
    .maybeSingle();

  if (fetchError) {
    console.error("[subscribe] fetch existing", fetchError);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  if (!existing) {
    const { error: insertError } = await client.from("subscribers").insert({
      email,
      source,
      status: "active",
      preferences: { segments: uniqueSegments },
    });
    if (insertError) {
      if (insertError.code === "23505") {
        return { success: true, message: "You're already subscribed. Check your inbox." };
      }
      console.error("[subscribe] insert", insertError);
      return { success: false, message: "Could not subscribe. Please try again." };
    }
    return { success: true, message: "You're in! Check your inbox." };
  }

  const prefs = (existing.preferences as { segments?: string[] } | null) ?? {};
  const existingSegments = Array.isArray(prefs.segments) ? prefs.segments : [];
  const merged = Array.from(new Set([...existingSegments, ...uniqueSegments]));

  const { error: updateError } = await client
    .from("subscribers")
    .update({ preferences: { ...prefs, segments: merged } })
    .eq("id", existing.id);

  if (updateError) {
    console.error("[subscribe] update", updateError);
    return { success: false, message: "Could not update preferences. Please try again." };
  }
  return { success: true, message: "You're in! Check your inbox." };
}
