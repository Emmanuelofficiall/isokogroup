-- Update RLS policies to use is_admin() function and tighten permissions
BEGIN;

-- Drop old policies if exist
DROP POLICY IF EXISTS "videos_insert_admin" ON public.videos;
DROP POLICY IF EXISTS "videos_manage_owner_or_admin" ON public.videos;
DROP POLICY IF EXISTS "live_manage_admins" ON public.live_streams;
DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
DROP POLICY IF EXISTS "comments_modify_owner_or_admin" ON public.comments;
DROP POLICY IF EXISTS "likes_insert_authenticated" ON public.likes;

-- Recreate videos policies
CREATE POLICY videos_public_select ON public.videos FOR SELECT USING (true);
CREATE POLICY videos_insert_admin ON public.videos FOR INSERT USING (is_admin()) WITH CHECK (is_admin() OR auth.uid() = created_by);
CREATE POLICY videos_manage_owner_or_admin ON public.videos FOR UPDATE USING (auth.uid() = created_by OR is_admin()) WITH CHECK (auth.uid() = created_by OR is_admin());

-- Live streams: only admins can manage
CREATE POLICY live_select_public ON public.live_streams FOR SELECT USING (true);
CREATE POLICY live_manage_admins ON public.live_streams FOR INSERT, UPDATE, DELETE USING (is_admin());

-- Comments: authenticated inserts; owners or admins can modify
CREATE POLICY comments_select_public ON public.comments FOR SELECT USING (true);
CREATE POLICY comments_insert_authenticated ON public.comments FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() = user_id);
CREATE POLICY comments_modify_owner_or_admin ON public.comments FOR UPDATE, DELETE USING (auth.uid() = user_id OR is_admin());

-- Likes
CREATE POLICY likes_select_public ON public.likes FOR SELECT USING (true);
CREATE POLICY likes_insert_authenticated ON public.likes FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() = user_id);

COMMIT;
