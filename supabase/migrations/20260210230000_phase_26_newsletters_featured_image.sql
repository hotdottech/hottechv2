-- Phase 26.4: Newsletter featured image

ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS featured_image TEXT;
