-- Migration: create videos, live_streams, comments, likes tables
-- Generated: 2026-08-08
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

-- Simple RPC to increment view safely (grant execute to authenticated via policy)
CREATE OR REPLACE FUNCTION public.increment_video_view(p_video uuid)
RETURNS bigint LANGUAGE sql AS $$
  UPDATE public.videos SET view_count = view_count + 1, updated_at = now() WHERE id = p_video RETURNING view_count;
$$;

-- Enable Row Level Security and basic policies
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Videos: allow public select
CREATE POLICY IF NOT EXISTS "videos_public_select" ON public.videos FOR SELECT USING (true);
-- Videos: allow insert/update/delete by admins or owner (note: adjust to your is_admin function)
CREATE POLICY IF NOT EXISTS "videos_insert_admin" ON public.videos FOR INSERT USING (auth.role() IS NOT NULL) WITH CHECK (auth.role() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "videos_manage_owner_or_admin" ON public.videos FOR UPDATE USING (auth.uid() = created_by OR current_setting('is_admin', true) = 'true') WITH CHECK (auth.uid() = created_by OR current_setting('is_admin', true) = 'true');

-- Live streams: public can select; only admins can insert/update/delete
CREATE POLICY IF NOT EXISTS "live_select_public" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "live_manage_admins" ON public.live_streams FOR ALL USING (current_setting('is_admin', true) = 'true');

-- Comments: public can select for visible videos/live_streams
CREATE POLICY IF NOT EXISTS "comments_select_public" ON public.comments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "comments_insert_authenticated" ON public.comments FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "comments_modify_owner_or_admin" ON public.comments FOR UPDATE, DELETE USING (auth.uid() = user_id OR current_setting('is_admin', true) = 'true');

-- Likes: allow select; authenticated users can insert (unique constraint prevents duplicates)
CREATE POLICY IF NOT EXISTS "likes_select_public" ON public.likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "likes_insert_authenticated" ON public.likes FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() = user_id);

COMMIT;

-- Note: replace current_setting('is_admin', true) checks with your DB functions (is_admin()) as appropriate.
