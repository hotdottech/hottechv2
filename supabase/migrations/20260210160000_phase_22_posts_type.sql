-- Phase 22.3.4: Add type column to posts ('external' vs internal).
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'internal';
