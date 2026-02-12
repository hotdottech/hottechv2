import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = typeof body?.slug === "string" ? body.slug.trim() : null;
    const path = typeof body?.path === "string" ? body.path.trim() : null;
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId.trim() : null;
    if (!visitorId || (!slug && !path)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const referrer = typeof body?.referrer === "string" ? body.referrer.trim() || null : null;
    const userAgent = typeof body?.userAgent === "string" ? body.userAgent.trim() || null : null;

    const supabase = await createClient();
    let postId: string | null = null;

    if (slug) {
      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!fetchError && post?.id) postId = post.id;
    }

    try {
      const row: Record<string, unknown> = {
        visitor_id: visitorId,
        post_id: postId ?? null,
        path: path ?? null,
        referrer: referrer ?? null,
        user_agent: userAgent ?? null,
      };
      const { error: insertError } = await supabase.from("post_analytics").insert(row);

      if (insertError) {
        console.error("ANALYTICS ERROR:", insertError);
      }
    } catch (error) {
      console.error("ANALYTICS ERROR:", error);
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
