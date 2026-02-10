"use server";

import React from "react";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { getNewsletter } from "@/lib/data";
import { serializeBodyForEmail } from "@/lib/newsletter-email";
import { supabase } from "@/lib/supabase";
import WeeklyNewsletter from "@/emails/WeeklyNewsletter";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "House Of Tech Newsletter <newsletter@emails.hot.tech>";
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://hot.tech";

export async function getStats(): Promise<{ count: number }> {
  const { count, error } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (error) {
    console.error("[getStats]", error);
    return { count: 0 };
  }
  return { count: count ?? 0 };
}

export async function sendTestEmail(
  slug: string,
  email: string
): Promise<{ error?: string }> {
  const newsletter = await getNewsletter(slug);
  if (!newsletter) {
    return { error: "Newsletter not found." };
  }

  const subject = newsletter.subject ?? "Hot Tech Newsletter";
  const previewText = newsletter.previewText ?? "";
  const emailBody = serializeBodyForEmail(newsletter.body);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `[Test] ${subject}`,
    react: (
      <WeeklyNewsletter
        subject={subject}
        previewText={previewText}
        body={emailBody}
        slug={slug}
        email={email}
        baseUrl={BASE_URL}
      />
    ),
  });

  if (error) {
    return { error: error.message };
  }
  return {};
}

export async function broadcastNewsletter(slug: string): Promise<{ error?: string; count?: number }> {
  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const newsletter = await getNewsletter(slug);
  if (!newsletter) {
    return { error: "Newsletter not found." };
  }

  const { data: subscribers, error: subError } = await supabase
    .from("subscribers")
    .select("email")
    .eq("status", "active");

  if (subError) {
    console.error("[broadcastNewsletter] Supabase error:", subError);
    return { error: "Failed to fetch subscribers." };
  }

  const emails = (subscribers ?? [])
    .map((r) => r.email)
    .filter((e): e is string => typeof e === "string" && e.length > 0);

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
          baseUrl={BASE_URL}
        />
      ),
    });
    if (error) {
      console.error("[broadcastNewsletter] Resend error for", to, error);
      continue;
    }
    sent++;
  }

  return { count: sent };
}
