-- Phase 36: Dynamic Footer – footer_config on site_settings (singleton)
-- Add footer_config JSONB to existing site_settings. Singleton row (id=1) already exists from phase 21.

ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS footer_config JSONB NOT NULL DEFAULT '{"columns":[[],[],[]]}'::jsonb;
