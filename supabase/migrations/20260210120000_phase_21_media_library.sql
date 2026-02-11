-- Phase 21: Media Library
-- Table for media item metadata and storage bucket configuration.

-- =============================================================================
-- 1. media_items table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (SELECT for anon and authenticated)
CREATE POLICY "Allow public read access"
  ON public.media_items
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow admin full access (ALL for authenticated users)
CREATE POLICY "Allow admin full access"
  ON public.media_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- 2. Storage bucket 'media'
-- =============================================================================
-- Note: If this insert fails (e.g. storage schema differs), create the bucket
-- in Dashboard: Storage → New bucket → name: media, public: on,
-- file size limit: 5MB, allowed MIME: image/jpeg, image/png, image/webp, image/gif
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  gen_random_uuid(),
  'media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (name) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- 3. Storage objects RLS policies (for bucket 'media')
-- =============================================================================
-- Policy: Public read (SELECT for all)
CREATE POLICY "Public Access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- Policy: Authenticated upload (INSERT for authenticated)
CREATE POLICY "Authenticated Upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Policy: Authenticated update/delete (UPDATE and DELETE for authenticated)
CREATE POLICY "Authenticated Update/Delete"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated Delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');
