-- Phase 25.4.1: SEO title templates (site_settings)

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS seo_template_post TEXT DEFAULT '{{title}} | {{site_title}}',
  ADD COLUMN IF NOT EXISTS seo_template_archive TEXT DEFAULT '{{title}} Archives | {{site_title}}',
  ADD COLUMN IF NOT EXISTS seo_template_page TEXT DEFAULT '{{title}} | {{site_title}}';
