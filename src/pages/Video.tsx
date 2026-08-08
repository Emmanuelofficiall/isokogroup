import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Comments from "@/components/videos/Comments";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { incrementViewOnce, fetchLikeStatus, likeVideo, unlikeVideo } from "@/lib/videos";

const Video = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<any | null>(null);
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
      if (mounted) setVideo(data ?? null);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // increment view once per session
    void incrementViewOnce(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchLikes = async () => {
      const result = await fetchLikeStatus(id, user?.id ?? null);
      if (!mounted) return;
      setLiked(result.liked);
      setLikesCount(result.count ?? 0);
    };
    fetchLikes();
    return () => {
      mounted = false;
    };
  }, [id, user?.id]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        {!video && <div>Loading…</div>}
        {video && (
          <div className="space-y-6">
            <div className="w-full bg-black/5 h-64 flex items-center justify-center">Video Player placeholder</div>
            <h1 className="text-2xl font-semibold">{video.title}</h1>
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground">👁 {video.view_count ?? 0}</div>
              <button
                className={`px-3 py-1 rounded ${liked ? "bg-red-600 text-white" : "border border-border"}`}
                onClick={async () => {
                  if (!user) return alert("Please log in to like videos.");
                  try {
                    if (!liked) {
                      const count = await likeVideo(video.id, user.id);
                      setLiked(true);
                      setLikesCount(count);
                    } else {
                      const count = await unlikeVideo(video.id, user.id);
                      setLiked(false);
                      setLikesCount(count);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                ❤️ {likesCount}
              </button>

              <button
                className="px-3 py-1 rounded border border-border"
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: video.title, url });
                    } catch {}
                  } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(url);
                    alert("Link copied!");
                  } else {
                    prompt("Copy link:", url);
                  }
                }}
              >
                ↗ Share
              </button>
            </div>

            <p className="text-muted-foreground">{video.description}</p>
            <section className="pt-6">
              <h2 className="text-lg font-semibold">Comments</h2>
              <Comments videoId={video.id} />
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Video;
