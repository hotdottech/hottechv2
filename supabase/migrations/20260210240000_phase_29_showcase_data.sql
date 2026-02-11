-- Phase 29.3: Showcase engine – posts showcase_data and content types.

-- Add showcase_data to posts (Best of / Awards lists).
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS showcase_data JSONB NOT NULL DEFAULT '[]';

-- Seed showcase content types (if not present). Use slug for programmatic check.
INSERT INTO public.content_types (name, slug)
VALUES
  ('Showcase: People', 'showcase_people'),
  ('Showcase: Products', 'showcase_products')
ON CONFLICT (slug) DO NOTHING;
