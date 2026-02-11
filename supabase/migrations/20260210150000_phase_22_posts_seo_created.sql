-- Phase 22.3.2: Add created_at, excerpt, and SEO columns to posts for ingest.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Backfill created_at from published_at where null (existing rows)
UPDATE public.posts SET created_at = published_at WHERE created_at IS NULL;

-- Default for new rows
ALTER TABLE public.posts ALTER COLUMN created_at SET DEFAULT now();
