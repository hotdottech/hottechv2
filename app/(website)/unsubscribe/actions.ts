"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function unsubscribeUser(id: string): Promise<{ error?: string }> {
  if (!id?.trim()) {
    return { error: "Missing subscriber ID." };
  }

  if (id === "test-preview-id") {
    return {};
  }

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .update({ status: "unsubscribed" })
    .eq("id", id.trim())
    .select("id");

  const count = data?.length ?? 0;

  if (error) {
    console.error("[unsubscribeUser]", error);
    return { error: "Failed to unsubscribe. Please try again." };
  }
  if (count === 0) {
    return { error: "Subscriber not found." };
  }
  return {};
}
