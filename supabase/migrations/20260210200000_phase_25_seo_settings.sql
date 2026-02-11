-- Phase 25.4: Global SEO settings (site_settings)
-- Add columns for SEO defaults and social links.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'House of Tech',
  ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Tech Reviews & News',
  ADD COLUMN IF NOT EXISTS social_twitter TEXT,
  ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
  ADD COLUMN IF NOT EXISTS default_og_image TEXT;
