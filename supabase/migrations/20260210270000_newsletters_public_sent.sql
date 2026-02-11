-- Allow public to read only sent newsletters (for archive).
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sent newsletters"
  ON public.newsletters
  FOR SELECT
  TO public
  USING (status = 'sent');
