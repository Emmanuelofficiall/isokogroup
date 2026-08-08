-- Add RPCs for live view and comment count increments
BEGIN;

CREATE OR REPLACE FUNCTION public.increment_live_view(p_live uuid)
RETURNS bigint LANGUAGE sql AS $$
  UPDATE public.live_streams SET view_count = view_count + 1, updated_at = now() WHERE id = p_live RETURNING view_count;
$$;

CREATE OR REPLACE FUNCTION public.recount_video_comments(p_video uuid)
RETURNS bigint LANGUAGE sql AS $$
  UPDATE public.videos SET comments_count = (SELECT COUNT(1) FROM public.comments WHERE video_id = p_video AND NOT deleted) WHERE id = p_video RETURNING comments_count;
$$;

CREATE OR REPLACE FUNCTION public.recount_live_comments(p_live uuid)
RETURNS bigint LANGUAGE sql AS $$
  UPDATE public.live_streams SET viewer_count = (SELECT COUNT(1) FROM public.comments WHERE live_stream_id = p_live AND NOT deleted) WHERE id = p_live RETURNING viewer_count;
$$;

COMMIT;
