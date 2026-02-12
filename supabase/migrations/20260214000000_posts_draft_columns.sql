-- Draft vs. Published: add nullable draft columns to posts.
-- Live columns: title, excerpt/summary, content, main_image/featured_image.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS draft_title TEXT,
  ADD COLUMN IF NOT EXISTS draft_summary TEXT,
  ADD COLUMN IF NOT EXISTS draft_content TEXT,
  ADD COLUMN IF NOT EXISTS draft_hero_image TEXT;

-- Backfill: copy current live values into draft so existing posts have draft = live.
-- excerpt was added in phase_22_posts_seo_created; summary and featured_image from original schema.
UPDATE public.posts
SET
  draft_title = title,
  draft_summary = COALESCE(excerpt, summary),
  draft_content = content,
  draft_hero_image = featured_image;
