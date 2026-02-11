-- Phase 22.6: Content Types taxonomy and post junction.

-- =============================================================================
-- 1. content_types
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.content_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_types_public_read"
  ON public.content_types FOR SELECT TO public USING (true);

CREATE POLICY "content_types_admin_full_access"
  ON public.content_types FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 2. post_content_types (junction)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.post_content_types (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content_type_id BIGINT NOT NULL REFERENCES public.content_types(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, content_type_id)
);

ALTER TABLE public.post_content_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_content_types_public_read"
  ON public.post_content_types FOR SELECT TO public USING (true);

CREATE POLICY "post_content_types_admin_full_access"
  ON public.post_content_types FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
