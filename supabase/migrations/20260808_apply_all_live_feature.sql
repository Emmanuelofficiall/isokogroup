-- Combined migration for live streaming, video library, comments, likes, RPCs, and RLS policies
BEGIN;

-- Videos table (recorded videos and converted livestreams)
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  thumbnail_url text,
  provider text,
  recording_url text,
  started_at timestamptz,
  ended_at timestamptz,
  created_by uuid,
  status text DEFAULT 'published',
  view_count bigint DEFAULT 0,
  like_count bigint DEFAULT 0,
  comments_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Live streams table (keeps history, not deleted when ended)
CREATE TABLE IF NOT EXISTS public.live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  thumbnail_url text,
  provider_info jsonb,
  stream_url text,
  recording_url text,
  status text DEFAULT 'scheduled',
  started_at timestamptz,
  ended_at timestamptz,
  created_by uuid,
  viewer_count bigint DEFAULT 0,
  view_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  live_stream_id uuid,
  user_id uuid NOT NULL,
  body text NOT NULL,
  parent_id uuid,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_like UNIQUE (video_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams (status);
CREATE INDEX IF NOT EXISTS idx_comments_video ON public.comments (video_id);

-- Simple RPCs
CREATE OR REPLACE FUNCTION public.increment_video_view(p_video uuid)
RETURNS bigint LANGUAGE sql AS $$
  UPDATE public.videos SET view_count = view_count + 1, updated_at = now() WHERE id = p_video RETURNING view_count;
$$;

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

  UPDATE public.live_streams SET status = 'ended', ended_at = coalesce(ended_at, now()), updated_at = now() WHERE id = p_live;

  INSERT INTO public.videos (title, description, category, thumbnail_url, provider, recording_url, started_at, ended_at, created_by, status, created_at, updated_at)
  VALUES (l.title, l.description, l.category, l.thumbnail_url, NULL, l.recording_url, l.started_at, coalesce(l.ended_at, now()), l.created_by, 'published', now(), now())
  RETURNING id INTO v_id;

  UPDATE public.comments SET video_id = v_id WHERE live_stream_id = p_live;

  UPDATE public.videos SET
    comments_count = (SELECT COUNT(1) FROM public.comments WHERE video_id = v_id AND NOT deleted),
    view_count = coalesce((SELECT view_count FROM public.live_streams WHERE id = p_live), 0)
  WHERE id = v_id;

  RETURN QUERY SELECT v_id;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY IF NOT EXISTS videos_public_select ON public.videos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS videos_insert_admin ON public.videos FOR INSERT USING (is_admin()) WITH CHECK (is_admin() OR auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS videos_manage_owner_or_admin ON public.videos FOR UPDATE USING (auth.uid() = created_by OR is_admin()) WITH CHECK (auth.uid() = created_by OR is_admin());

CREATE POLICY IF NOT EXISTS live_select_public ON public.live_streams FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS live_manage_admins ON public.live_streams FOR INSERT, UPDATE, DELETE USING (is_admin());

CREATE POLICY IF NOT EXISTS comments_select_public ON public.comments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS comments_insert_authenticated ON public.comments FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS comments_modify_owner_or_admin ON public.comments FOR UPDATE, DELETE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY IF NOT EXISTS likes_select_public ON public.likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS likes_insert_authenticated ON public.likes FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() = user_id);

COMMIT;
