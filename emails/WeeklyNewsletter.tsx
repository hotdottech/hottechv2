import * as React from "react";
import {
  Html,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Head,
  Preview,
  Img,
} from "@react-email/components";

const DEFAULT_BASE_URL = "https://hot.tech";

export interface WeeklyNewsletterProps {
  subject: string;
  previewText: string;
  /** Raw HTML string from Tiptap editor. */
  content: string;
  slug: string;
  /** Subscriber email for the unsubscribe link (passed by send API per recipient). */
  email: string;
  /** Full URL for the unsubscribe page (e.g. https://hot.tech/unsubscribe?id=...). Passed from server per recipient. */
  unsubscribeUrl: string;
  /** Base URL for links (e.g. https://hot.tech). Passed from server so env is available. */
  baseUrl?: string;
  /** Tracking pixel URL for open tracking (per-recipient). */
  trackingPixelUrl?: string;
}

const styles = {
  dark: {
    backgroundColor: "#000000",
    color: "#ffffff",
    muted: "#9ca3af",
    border: "1px solid rgba(255,255,255,0.1)",
  },
};

export function WeeklyNewsletter({
  subject,
  previewText,
  content,
  slug,
  email,
  unsubscribeUrl,
  baseUrl = DEFAULT_BASE_URL,
  trackingPixelUrl,
}: WeeklyNewsletterProps) {
  const viewInBrowserUrl = `${baseUrl}/newsletters/${slug}`;

  return (
    <Html lang="en">
      <Head>
        <style>{`
          .newsletter-body p { margin: 0 0 1em 0; color: #9ca3af; font-size: 16px; line-height: 1.6; }
          .newsletter-body h1, .newsletter-body h2 { color: #ffffff; font-size: 20px; margin: 1em 0 0.5em 0; }
          .newsletter-body img { max-width: 100%; height: auto; display: block; }
        `}</style>
      </Head>
      <Preview>{previewText || subject}</Preview>
      <Section style={{ backgroundColor: styles.dark.backgroundColor, padding: "24px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <Section style={{ padding: "0 24px 24px" }}>
            <Link href={baseUrl} style={{ color: styles.dark.color, textDecoration: "none", fontSize: "20px", fontWeight: 600 }}>
              Hot Tech
            </Link>
          </Section>

          {/* Subject as heading */}
          <Section style={{ padding: "0 24px 24px" }}>
            <Text style={{ color: styles.dark.color, fontSize: "24px", fontWeight: 600, margin: 0 }}>
              {subject}
            </Text>
          </Section>

          {/* Body: raw HTML from Tiptap (p, h1, img styled via .newsletter-body in Head) */}
          <Section style={{ padding: "40px 24px" }} className="px-10 py-5">
            <div
              className="newsletter-body"
              style={{
                color: styles.dark.muted,
                fontSize: "16px",
                lineHeight: "1.6",
              }}
              dangerouslySetInnerHTML={{ __html: content || "" }}
            />
          </Section>

          {/* Footer */}
          <Section style={{ padding: "32px 24px 24px", marginTop: "24px" }}>
            <Hr style={{ borderColor: "rgba(255,255,255,0.1)", marginBottom: "20px" }} />
            <Text
              style={{
                color: styles.dark.muted,
                fontSize: "12px",
                margin: "0 0 8px 0",
              }}
            >
              <Link href={viewInBrowserUrl} style={{ color: styles.dark.muted }}>
                View in browser
              </Link>
              {" · "}
              <Link href={unsubscribeUrl} style={{ color: styles.dark.muted }}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={{ color: styles.dark.muted, fontSize: "12px", margin: 0 }}>
              © Hot Tech. You received this because you subscribed to our newsletter.
            </Text>
            {trackingPixelUrl && (
              <Img
                src={trackingPixelUrl}
                alt=""
                width={1}
                height={1}
                style={{ display: "none" }}
              />
            )}
          </Section>
        </Container>
      </Section>
    </Html>
  );
}

export default WeeklyNewsletter;
