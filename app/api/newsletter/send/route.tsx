import React from "react";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getNewsletter } from "@/lib/data";
import { serializeBodyForEmail } from "@/lib/newsletter-email";
import { supabase } from "@/lib/supabase";
import WeeklyNewsletter from "@/emails/WeeklyNewsletter";

const resend = new Resend(process.env.RESEND_API_KEY);
const CRON_SECRET = process.env.CRON_SECRET;
const FROM_EMAIL = "House Of Tech Newsletter <newsletter@emails.hot.tech>";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = CRON_SECRET ? `Bearer ${CRON_SECRET}` : "";
  if (!auth || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let slug: string | null = null;
  try {
    const url = new URL(request.url);
    slug = url.searchParams.get("slug");
    if (!slug) {
      const body = await request.json().catch(() => ({}));
      slug = typeof (body as { slug?: string }).slug === "string" ? (body as { slug: string }).slug : null;
    }
  } catch {
    // ignore
  }

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const newsletter = await getNewsletter(slug);
  if (!newsletter) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  const { data: subscribers, error: subError } = await supabase
    .from("subscribers")
    .select("email")
    .eq("status", "active");

  if (subError) {
    console.error("[newsletter/send] Supabase error:", subError);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }

  const emails = (subscribers ?? []).map((r) => r.email).filter((e): e is string => typeof e === "string" && e.length > 0);
  if (emails.length === 0) {
    return NextResponse.json({ success: true, count: 0 });
  }

  const subject = newsletter.subject ?? "Hot Tech Newsletter";
  const previewText = newsletter.previewText ?? "";
  const emailBody = serializeBodyForEmail(newsletter.body);

  let sent = 0;
  for (const to of emails) {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react: (
        <WeeklyNewsletter
          subject={subject}
          previewText={previewText}
          body={emailBody}
          slug={slug}
          email={to}
          baseUrl={process.env.NEXT_PUBLIC_URL ?? "https://hot.tech"}
        />
      ),
    });
    if (error) {
      console.error("[newsletter/send] Resend error for", to, error);
      continue;
    }
    sent++;
  }

  return NextResponse.json({ success: true, count: sent });
}
