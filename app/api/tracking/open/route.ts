import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// 1x1 transparent GIF (43 bytes)
const GIF_1X1 = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const newsletterId = searchParams.get("id")?.trim() || null;
  const subscriberId = searchParams.get("sub")?.trim() || null;

  if (newsletterId) {
    try {
      const supabase = await createClient();
      await supabase.from("newsletter_events").insert({
        newsletter_id: newsletterId,
        recipient_id: subscriberId,
        type: "OPEN",
      });
    } catch (e) {
      console.error("[tracking/open]", e);
    }
  }

  return new NextResponse(GIF_1X1, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store",
    },
  });
}
