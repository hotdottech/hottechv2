-- Audit: Ensure ALL site_settings columns exist and reload PostgREST schema cache.
-- Run this in Supabase SQL Editor if you see "column not found in schema cache".
--
-- Fields identified from:
--   • app/(admin)/admin/settings/page.tsx (read: select *; write: site_name, site_description, logo_url, headshot_url, show_logo, cta_settings, updated_at)
--   • app/components/admin/settings/SeoSettings.tsx (read/write via updateSeoSettings: seo_title, seo_description, social_twitter, social_linkedin, default_og_image, seo_template_post, seo_template_archive, seo_template_page)
--   • lib/actions/settings.ts (getHomepageLayout: homepage_layout; getNavigationMenu/updateNavigation: navigation_menu; updateFooterSettings: footer_config)
--   • lib/data.ts getSiteSettings (select *)
--
-- Complete column list: id (PK, from CREATE TABLE), site_name, site_description, logo_url, headshot_url, show_logo, navigation_menu, cta_settings, social_links, updated_at, homepage_layout, seo_title, seo_description, social_twitter, social_linkedin, default_og_image, seo_template_post, seo_template_archive, seo_template_page, footer_config

-- Ensure table exists (id is created here; do not re-add id)
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

-- Add every column that may have been introduced in later migrations (no-op if already present)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'Hot Tech',
  ADD COLUMN IF NOT EXISTS site_description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS headshot_url TEXT,
  ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS navigation_menu JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_settings JSONB DEFAULT '{"type": "subscribe", "label": "Subscribe", "url": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS homepage_layout JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS social_twitter TEXT,
  ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
  ADD COLUMN IF NOT EXISTS default_og_image TEXT;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS seo_template_post TEXT,
  ADD COLUMN IF NOT EXISTS seo_template_archive TEXT,
  ADD COLUMN IF NOT EXISTS seo_template_page TEXT;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS footer_config JSONB DEFAULT '{"columns":[[],[],[]]}'::jsonb;

-- Reload PostgREST schema cache so API sees all columns
NOTIFY pgrst, 'reload config';
