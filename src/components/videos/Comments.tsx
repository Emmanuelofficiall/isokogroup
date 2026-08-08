import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { recount_video_comments, recount_live_comments } from "@/lib/videos";

type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
};

const Comments = ({ videoId, liveStreamId }: { videoId?: string | null; liveStreamId?: string | null }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new comments arrive (useful for live chat)
    if (containerRef.current) {
      try {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      } catch {}
    }
  }, [comments]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      let q = supabase.from("comments").select("id, user_id, body, created_at");
      if (videoId) q = q.eq("video_id", videoId);
      if (liveStreamId) q = q.eq("live_stream_id", liveStreamId);
      const { data } = await q.order("created_at", { ascending: true }).limit(100);
      if (mounted && data) setComments(data as CommentRow[]);
      // fetch profile names for commenters
      try {
        const ids = Array.from(new Set((data || []).map((d: any) => d.user_id).filter(Boolean)));
        if (ids.length) {
          const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", ids);
          const map: Record<string, any> = {};
          (profiles || []).forEach((p: any) => (map[p.user_id] = p));
          setProfilesMap(map);
        }
      } catch (e) {
        // ignore
      }
    };
    load();

    const channel = supabase
      .channel(`public:comments:${videoId ?? liveStreamId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const newRow = payload.new as CommentRow;
          if (videoId && payload.new.video_id === videoId) setComments((s) => [...s, newRow]);
          if (liveStreamId && payload.new.live_stream_id === liveStreamId) setComments((s) => [...s, newRow]);
          // update profile map for the new comment
          (async () => {
            try {
              const { data: p } = await supabase.from("profiles").select("user_id, full_name, avatar_url").eq("user_id", newRow.user_id).maybeSingle();
              if (p) setProfilesMap((m) => ({ ...m, [p.user_id]: p }));
            } catch {}
          })();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        void supabase.removeChannel(channel);
      } catch {}
    };
  }, [videoId, liveStreamId]);

  const post = async () => {
    if (!user) {
      alert("Please log in to comment.");
      return;
    }
    if (!text.trim()) return;
    const payload: any = { user_id: user.id, body: text.trim() };
    if (videoId) payload.video_id = videoId;
    if (liveStreamId) payload.live_stream_id = liveStreamId;
    const { data, error } = await supabase.from("comments").insert(payload).select().maybeSingle();
    if (error) {
      console.error(error);
      return;
    }
    setText("");
    // update counts
    try {
      if (videoId) await recount_video_comments(videoId);
      if (liveStreamId) await recount_live_comments(liveStreamId);
    } catch (e) {
      // ignore
    }
    // New comment will be appended via realtime subscription
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) console.error(error);
    else setComments((s) => s.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2" ref={containerRef}>
        {comments.map((c) => (
          <div key={c.id} className="p-2 border border-border rounded">
            <div className="flex items-center gap-2">
              {profilesMap[c.user_id]?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilesMap[c.user_id].avatar_url} alt={profilesMap[c.user_id].full_name || ""} className="h-6 w-6 rounded-full" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted" />
              )}
              <div className="text-sm font-medium">{profilesMap[c.user_id]?.full_name ?? c.user_id.slice(0, 8)}</div>
            </div>
            <div className="mt-1">{c.body}</div>
            <div className="text-xs text-muted-foreground mt-2 flex justify-between">
              <span>{new Date(c.created_at).toLocaleString()}</span>
              {user?.id === c.user_id && (
                <button className="text-red-600" onClick={() => remove(c.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <textarea className="w-full p-2 border border-border rounded" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." />
        <div className="flex justify-end mt-2">
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={post}>Post Comment</button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
