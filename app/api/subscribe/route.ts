import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    const { error } = await supabase.from("subscribers").insert({
      email,
      created_at: new Date().toISOString(),
      status: "active",
      preferences: { all: true },
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      console.error("[subscribe]", error);
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Subscribed" });
  } catch (err) {
    console.error("[subscribe]", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
