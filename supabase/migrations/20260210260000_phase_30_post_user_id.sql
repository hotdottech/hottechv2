-- Phase 30: Secure preview – track post author for draft access.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Optional: uncomment to enforce FK when auth.users is accessible.
-- ALTER TABLE public.posts
--   ADD CONSTRAINT posts_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
