-- Phase 22: Content Engine Tables
-- Categories, tags, posts, and junction tables with RLS.

-- =============================================================================
-- 1. categories
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT TO public USING (true);

CREATE POLICY "categories_admin_full_access"
  ON public.categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 2. tags
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_public_read"
  ON public.tags FOR SELECT TO public USING (true);

CREATE POLICY "tags_admin_full_access"
  ON public.tags FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 3. posts
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  original_url TEXT,
  source_name TEXT,
  guid TEXT UNIQUE
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read"
  ON public.posts FOR SELECT TO public USING (true);

CREATE POLICY "posts_admin_full_access"
  ON public.posts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 4. post_categories (junction)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.post_categories (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_categories_public_read"
  ON public.post_categories FOR SELECT TO public USING (true);

CREATE POLICY "post_categories_admin_full_access"
  ON public.post_categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 5. post_tags (junction)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_tags_public_read"
  ON public.post_tags FOR SELECT TO public USING (true);

CREATE POLICY "post_tags_admin_full_access"
  ON public.post_tags FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
