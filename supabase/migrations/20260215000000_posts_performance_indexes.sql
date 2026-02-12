-- Performance indexes for public posts table.
-- Run in Supabase SQL Editor if not using migrations.
-- slug: post lookups by slug (getPostBySlug). UNIQUE(slug) already creates an index; this is a no-op if so.
-- published_at: feed ordering (homepage, taxonomy pages).
-- status + published_at: common filter for "published posts ordered by date".

-- Slug: for post lookups by slug (getPostBySlug). Omit if posts.slug already has UNIQUE (unique implies index).
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);

-- Feed ordering and date-based queries
CREATE INDEX IF NOT EXISTS idx_posts_published_at_desc ON public.posts(published_at DESC NULLS LAST);

-- Published feed: status = 'published' + order by published_at
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON public.posts(status, published_at DESC NULLS LAST);
