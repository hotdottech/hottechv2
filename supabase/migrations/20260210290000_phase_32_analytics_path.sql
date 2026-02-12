-- Phase 32: Flexible analytics - path-based tracking (e.g. homepage)
-- Make post_id nullable and add path column to post_analytics

ALTER TABLE public.post_analytics
  ALTER COLUMN post_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS path TEXT;
