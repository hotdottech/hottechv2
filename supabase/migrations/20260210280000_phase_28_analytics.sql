-- Phase 28.1: Analytics Engine & Tracking Pixel
-- post_analytics, newsletter_events, subscribers(created_at) index

-- =============================================================================
-- 1. post_analytics
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON public.post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_visitor_id ON public.post_analytics(visitor_id);

ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Service/API inserts only (no public read for privacy). Allow anon for track API.
CREATE POLICY "Allow insert for anon (track API)"
  ON public.post_analytics FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Admin full access post_analytics"
  ON public.post_analytics FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 2. newsletter_events
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
  recipient_id TEXT,
  type TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_events_newsletter_id ON public.newsletter_events(newsletter_id);

ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for anon (open pixel)"
  ON public.newsletter_events FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Admin full access newsletter_events"
  ON public.newsletter_events FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 3. Subscribers index for chart queries
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at);
