-- Phase 29.4: Page display options (e.g. hide header for landing pages).
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS display_options JSONB NOT NULL DEFAULT '{}';
