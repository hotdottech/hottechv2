-- Add path column if it doesn't exist
ALTER TABLE post_analytics 
ADD COLUMN IF NOT EXISTS path TEXT;
-- Make post_id nullable (so we can track homepage views where post_id is null)
ALTER TABLE post_analytics 
ALTER COLUMN post_id DROP NOT NULL;
