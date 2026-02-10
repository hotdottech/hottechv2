import * as React from "react";
import {
  Html,
  Container,
  Section,
  Text,
  Img,
  Link,
  Hr,
  Head,
  Preview,
} from "@react-email/components";

const BASE_URL = "https://hot.tech";

export type EmailBodyBlock =
  | { type: "block"; paragraphs: string[] }
  | {
      type: "reference";
      title: string;
      slug: string;
      excerpt: string | null;
      imageUrl: string | null;
    }
  | {
      type: "externalLink";
      title: string;
      url: string;
      description: string | null;
      imageUrl: string | null;
    }
  | { type: "sectionHeader"; title: string };

export interface WeeklyNewsletterProps {
  subject: string;
  previewText: string;
  body: EmailBodyBlock[];
  slug: string;
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
  body,
  slug,
}: WeeklyNewsletterProps) {
  const viewInBrowserUrl = `${BASE_URL}/newsletters/${slug}`;
  const unsubscribeUrl = `${BASE_URL}/newsletters/unsubscribe`; // placeholder

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText || subject}</Preview>
      <Section style={{ backgroundColor: styles.dark.backgroundColor, padding: "24px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <Section style={{ padding: "0 24px 24px" }}>
            <Link href={BASE_URL} style={{ color: styles.dark.color, textDecoration: "none", fontSize: "20px", fontWeight: 600 }}>
              Hot Tech
            </Link>
          </Section>

          {/* Subject as heading */}
          <Section style={{ padding: "0 24px 24px" }}>
            <Text style={{ color: styles.dark.color, fontSize: "24px", fontWeight: 600, margin: 0 }}>
              {subject}
            </Text>
          </Section>

          {/* Body blocks */}
          <Section style={{ padding: "0 24px" }}>
            {body.map((block, index) => {
              if (block.type === "block") {
                return (
                  <Section key={index} style={{ marginBottom: "20px" }}>
                    {block.paragraphs.map((p, i) => (
                      <Text
                        key={i}
                        style={{
                          color: styles.dark.muted,
                          fontSize: "16px",
                          lineHeight: "1.6",
                          margin: "0 0 12px 0",
                        }}
                      >
                        {p}
                      </Text>
                    ))}
                  </Section>
                );
              }

              if (block.type === "sectionHeader") {
                return (
                  <Section key={index} style={{ marginTop: "28px", marginBottom: "12px" }}>
                    <Text
                      style={{
                        color: styles.dark.color,
                        fontSize: "20px",
                        fontWeight: 600,
                        margin: "0 0 8px 0",
                      }}
                    >
                      {block.title}
                    </Text>
                    <Hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: 0 }} />
                  </Section>
                );
              }

              if (block.type === "reference") {
                const href = `${BASE_URL}/${block.slug}`;
                return (
                  <Section
                    key={index}
                    style={{
                      marginBottom: "20px",
                      padding: "16px",
                      border: styles.dark.border,
                      borderRadius: "8px",
                    }}
                  >
                    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            {block.imageUrl && (
                              <td style={{ width: "128px", verticalAlign: "top", paddingRight: "16px" }}>
                                <Img
                                  src={block.imageUrl}
                                  alt=""
                                  width={128}
                                  height={96}
                                  style={{ borderRadius: "6px", display: "block", objectFit: "cover" }}
                                />
                              </td>
                            )}
                            <td style={{ verticalAlign: "top" }}>
                              <Text
                                style={{
                                  color: styles.dark.color,
                                  fontSize: "16px",
                                  fontWeight: 600,
                                  margin: "0 0 4px 0",
                                }}
                              >
                                {block.title || "Untitled"}
                              </Text>
                              {block.excerpt && (
                                <Text
                                  style={{
                                    color: styles.dark.muted,
                                    fontSize: "14px",
                                    lineHeight: "1.4",
                                    margin: 0,
                                  }}
                                >
                                  {block.excerpt}
                                </Text>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Link>
                  </Section>
                );
              }

              if (block.type === "externalLink") {
                return (
                  <Section
                    key={index}
                    style={{
                      marginBottom: "20px",
                      padding: "16px",
                      border: styles.dark.border,
                      borderRadius: "8px",
                    }}
                  >
                    <Link href={block.url} style={{ textDecoration: "none", color: "inherit" }}>
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            {block.imageUrl && (
                              <td style={{ width: "128px", verticalAlign: "top", paddingRight: "16px" }}>
                                <Img
                                  src={block.imageUrl}
                                  alt=""
                                  width={128}
                                  height={96}
                                  style={{ borderRadius: "6px", display: "block", objectFit: "cover" }}
                                />
                              </td>
                            )}
                            <td style={{ verticalAlign: "top" }}>
                              <Text
                                style={{
                                  color: styles.dark.color,
                                  fontSize: "16px",
                                  fontWeight: 600,
                                  margin: "0 0 4px 0",
                                }}
                              >
                                {block.title || "Link"}
                              </Text>
                              {block.description && (
                                <Text
                                  style={{
                                    color: styles.dark.muted,
                                    fontSize: "14px",
                                    lineHeight: "1.4",
                                    margin: 0,
                                  }}
                                >
                                  {block.description}
                                </Text>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Link>
                  </Section>
                );
              }

              return null;
            })}
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
          </Section>
        </Container>
      </Section>
    </Html>
  );
}

export default WeeklyNewsletter;
