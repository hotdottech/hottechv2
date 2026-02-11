-- RLS fix for subscribers table
-- Addresses "Unrestricted" warning: enable RLS and restrict access appropriately.
-- Policy 1: Allow public INSERT so the website footer signup form works.
-- Policy 2: Allow authenticated users (admin) full SELECT, UPDATE, DELETE.

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (e.g. footer subscribe form). No auth required.
CREATE POLICY "Allow public INSERT"
  ON public.subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admin) full access for management.
CREATE POLICY "Allow Admin FULL ACCESS"
  ON public.subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
