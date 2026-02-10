import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.redirect(new URL("/newsletter/unsubscribed?error=missing", request.url), 302);
  }

  const { error } = await supabase
    .from("subscribers")
    .update({ status: "unsubscribed" })
    .eq("email", email);

  if (error) {
    console.error("[newsletter/unsubscribe]", error);
  }

  return NextResponse.redirect(new URL("/newsletter/unsubscribed", request.url), 302);
}
