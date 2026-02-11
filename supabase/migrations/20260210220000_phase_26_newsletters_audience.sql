-- Phase 26.3: Newsletter audience (target_config, stats, RLS)

-- Add audience columns if newsletters table already exists
ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS target_config JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stats JSONB NOT NULL DEFAULT '{}';

-- RLS: Admin only (authenticated users; tighten with profiles.role = 'admin' if profiles exists)
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access newsletters" ON public.newsletters;
CREATE POLICY "Admin full access newsletters"
  ON public.newsletters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
