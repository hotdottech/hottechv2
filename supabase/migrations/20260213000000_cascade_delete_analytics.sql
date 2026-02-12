-- Fix post deletion: allow deleting posts by cascading deletes from post_analytics (and newsletter_events).
-- Drop the existing strict constraint and re-add with ON DELETE CASCADE.

-- post_analytics: when a post is deleted, delete its analytics rows
ALTER TABLE public.post_analytics
  DROP CONSTRAINT IF EXISTS post_analytics_post_id_fkey;

ALTER TABLE public.post_analytics
  ADD CONSTRAINT post_analytics_post_id_fkey
  FOREIGN KEY (post_id)
  REFERENCES public.posts(id)
  ON DELETE CASCADE;

-- newsletter_events: when a newsletter is deleted, delete its event rows
ALTER TABLE public.newsletter_events
  DROP CONSTRAINT IF EXISTS newsletter_events_newsletter_id_fkey;

ALTER TABLE public.newsletter_events
  ADD CONSTRAINT newsletter_events_newsletter_id_fkey
  FOREIGN KEY (newsletter_id)
  REFERENCES public.newsletters(id)
  ON DELETE CASCADE;
