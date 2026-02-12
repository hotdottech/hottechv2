import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = "House of Tech Contact Form <contact@emails.hot.tech>";
const TO = "nirave@hot.tech";

type Body = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, topic, message" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const subject = `[${topic}] Contact from ${name}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #111;">New contact form submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Name</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Topic</td><td style="padding: 8px 0;">${escapeHtml(topic)}</td></tr>
        </table>
        <p style="color: #666; margin-top: 16px;">Message:</p>
        <div style="margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(message)}</div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
