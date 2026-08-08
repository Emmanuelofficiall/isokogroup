-- Convert a live_stream to a videos record transactionally and attach comments
BEGIN;

CREATE OR REPLACE FUNCTION public.convert_live_to_video(p_live uuid)
RETURNS TABLE(video_id uuid) LANGUAGE plpgsql AS $$
DECLARE
  l record;
  v_id uuid;
BEGIN
  SELECT * INTO l FROM public.live_streams WHERE id = p_live FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'live not found';
  END IF;

  -- mark live ended if not already
  UPDATE public.live_streams SET status = 'ended', ended_at = coalesce(ended_at, now()), updated_at = now() WHERE id = p_live;

  -- create video record
  INSERT INTO public.videos (title, description, category, thumbnail_url, provider, recording_url, started_at, ended_at, created_by, status, created_at, updated_at)
  VALUES (l.title, l.description, l.category, l.thumbnail_url, NULL, l.recording_url, l.started_at, coalesce(l.ended_at, now()), l.created_by, 'published', now(), now())
  RETURNING id INTO v_id;

  -- attach comments from live to video
  UPDATE public.comments SET video_id = v_id WHERE live_stream_id = p_live;

  -- update counts on video
  UPDATE public.videos SET
    comments_count = (SELECT COUNT(1) FROM public.comments WHERE video_id = v_id AND NOT deleted),
    view_count = coalesce((SELECT view_count FROM public.live_streams WHERE id = p_live), 0)
  WHERE id = v_id;

  RETURN QUERY SELECT v_id;
END;
$$;

COMMIT;
