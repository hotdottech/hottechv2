-- Phase 24: Homepage layout (block engine)
-- Store ordered list of homepage blocks in site_settings.

ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS homepage_layout JSONB NOT NULL DEFAULT '[
  {"id": "hero-1", "type": "hero", "enabled": true},
  {"id": "grid-1", "type": "feature_grid", "enabled": true},
  {"id": "feed-1", "type": "smart_feed", "enabled": true}
]'::jsonb;
