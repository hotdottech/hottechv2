-- Phase 22.4.1: Add parent_id for nested categories (self-referencing FK).
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id BIGINT NULL
  REFERENCES public.categories(id) ON DELETE SET NULL;
