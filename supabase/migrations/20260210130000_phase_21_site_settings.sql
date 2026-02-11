-- Phase 21: Site Settings (Singleton)
-- Global site identity and configuration.

-- =============================================================================
-- 1. site_settings table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'Hot Tech',
  site_description TEXT,
  logo_url TEXT,
  headshot_url TEXT,
  show_logo BOOLEAN NOT NULL DEFAULT false,
  navigation_menu JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_settings JSONB NOT NULL DEFAULT '{"type": "subscribe", "label": "Subscribe", "url": ""}'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

-- =============================================================================
-- 2. RLS
-- =============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public Read: SELECT for anon and authenticated
CREATE POLICY "Public Read"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- Admin Update: UPDATE for authenticated only
CREATE POLICY "Admin Update"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin Insert: INSERT for authenticated
CREATE POLICY "Admin Insert"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================================================
-- 3. Initialize singleton row
-- =============================================================================
INSERT INTO public.site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
