import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = typeof body?.slug === "string" ? body.slug.trim() : null;
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId.trim() : null;
    if (!slug || !visitorId) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const referrer = typeof body?.referrer === "string" ? body.referrer.trim() || null : null;
    const userAgent = typeof body?.userAgent === "string" ? body.userAgent.trim() || null : null;

    const supabase = await createClient();
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (fetchError || !post?.id) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { error: insertError } = await supabase.from("post_analytics").insert({
      post_id: post.id,
      visitor_id: visitorId,
      referrer,
      user_agent: userAgent,
    });

    if (insertError) {
      console.error("[analytics/track]", insertError);
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
