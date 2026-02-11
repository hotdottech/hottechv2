"use server";

import { Resend } from "resend";
import { WeeklyNewsletter } from "@/emails/WeeklyNewsletter";

const DELAY_MS = 600;

export type SendBroadcastParams = {
  newsletter: {
    id: string;
    subject: string;
    preview_text: string | null;
    content: string | null;
    slug: string;
  };
  subscribers: { id: string; email: string }[];
  baseUrl: string;
  fromEmail: string;
};

export type SendBroadcastResult = {
  success: true;
  sent_count: number;
  error_count: number;
};

/**
 * Send newsletter to subscribers sequentially with a delay between each
 * to stay under Resend rate limits (~1.5 req/sec).
 */
export async function sendBroadcast(
  params: SendBroadcastParams
): Promise<SendBroadcastResult> {
  const { newsletter, subscribers, baseUrl, fromEmail } = params;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");

  const resend = new Resend(apiKey);
  const subject = newsletter.subject ?? "Newsletter";
  const previewText = newsletter.preview_text ?? subject;
  const content = newsletter.content ?? "";
  const slugVal = newsletter.slug;

  let sent_count = 0;
  let error_count = 0;

  const newsletterId = newsletter.id;

  for (const subscriber of subscribers) {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

    try {
      const unsubscribeUrl = `${baseUrl}/unsubscribe?id=${subscriber.id}`;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || baseUrl;
      const trackingPixelUrl = `${siteUrl}/api/tracking/open?id=${newsletterId}&sub=${subscriber.id}`;
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [subscriber.email],
        subject,
        headers: { "List-Unsubscribe": unsubscribeUrl },
        react: WeeklyNewsletter({
          subject,
          previewText,
          content,
          slug: slugVal,
          email: subscriber.email,
          unsubscribeUrl,
          baseUrl,
          trackingPixelUrl,
        }),
      });
      if (error) {
        console.error("[sendBroadcast]", subscriber.email, error);
        error_count += 1;
      } else {
        sent_count += 1;
      }
    } catch (err) {
      console.error("[sendBroadcast]", subscriber.email, err);
      error_count += 1;
    }
  }

  return { success: true, sent_count, error_count };
}
