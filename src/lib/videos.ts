import { supabase } from "@/integrations/supabase/client";

export async function incrementViewOnce(videoId: string) {
  try {
    const key = `isoko_viewed_${videoId}`;
    if (sessionStorage.getItem(key)) return null;
    const { data, error } = await supabase.rpc("increment_video_view", { p_video: videoId });
    if (!error) sessionStorage.setItem(key, "1");
    return { data, error };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function fetchLikeStatus(videoId: string, userId: string | null) {
  if (!userId) return { liked: false, count: 0 };
  const [{ data: existing }, { data: countData, count }] = await Promise.all([
    supabase.from("likes").select("id").eq("video_id", videoId).eq("user_id", userId).maybeSingle(),
    supabase.from("likes").select("id", { count: "exact" }).eq("video_id", videoId),
  ]);
  return { liked: !!existing, count: count ?? 0 };
}

export async function likeVideo(videoId: string, userId: string) {
  const { error } = await supabase.from("likes").insert({ video_id: videoId, user_id: userId });
  if (error) throw error;
  const { count } = await supabase.from("likes").select("id", { count: "exact" }).eq("video_id", videoId);
  return count ?? 0;
}

export async function unlikeVideo(videoId: string, userId: string) {
  const { error } = await supabase.from("likes").delete().eq("video_id", videoId).eq("user_id", userId);
  if (error) throw error;
  const { count } = await supabase.from("likes").select("id", { count: "exact" }).eq("video_id", videoId);
  return count ?? 0;
}

export async function recount_video_comments(videoId: string) {
  try {
    const { data, error } = await supabase.rpc("recount_video_comments", { p_video: videoId });
    return { data, error };
  } catch (e) {
    return null;
  }
}

export async function recount_live_comments(liveId: string) {
  try {
    const { data, error } = await supabase.rpc("recount_live_comments", { p_live: liveId });
    return { data, error };
  } catch (e) {
    return null;
  }
}

export async function convertLiveToVideo(liveId: string) {
  try {
    const { data, error } = await supabase.rpc("convert_live_to_video", { p_live: liveId });
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

export type FetchVideosParams = {
  limit?: number;
  offset?: number;
  search?: string | null;
  category?: string | null;
};

export async function fetchVideos({ limit = 12, offset = 0, search = null, category = null }: FetchVideosParams) {
  let query = supabase.from("videos").select("id, title, thumbnail_url, category, created_at, view_count, like_count, comments_count");
  if (search) query = query.ilike("title", `%${search}%`);
  if (category) query = query.eq("category", category);
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  const res = await query;
  return res;
}
