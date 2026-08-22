import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Comments from "@/components/videos/Comments";
import { supabase } from "@/integrations/supabase/client";
import { increment_live_view } from "@/lib/live";

const Live = () => {
  const { id } = useParams();
  const [stream, setStream] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("live_streams").select("*").eq("id", id).maybeSingle();
      if (mounted) {
        setStream(data ?? null);
        setLoading(false);
        if (data?.status === "live") void increment_live_view(id);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [id]);

  const isVideo = stream?.stream_url && /\.(m3u8|mp4)(\?|$)/i.test(stream.stream_url);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        {loading && <div>Loading live stream…</div>}
        {!loading && !stream && <div className="space-y-3"><h1 className="text-2xl font-semibold">Live stream not found</h1><Link className="text-primary" to="/">Return home</Link></div>}
        {stream && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-red-600 font-semibold"><span className="h-3 w-3 rounded-full bg-red-600 animate-pulse" /> {stream.status === "live" ? "LIVE NOW" : "This live has ended"}</div>
            {stream.status === "live" && stream.stream_url ? (
              isVideo ? <video className="w-full max-h-[70vh] bg-black rounded-lg" src={stream.stream_url} controls autoPlay playsInline /> :
                <iframe className="w-full aspect-video rounded-lg bg-black" src={stream.stream_url} title={stream.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : (
              <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">The stream player will appear here.</div>
            )}
            <div><h1 className="text-3xl font-display font-bold">{stream.title}</h1><p className="mt-2 text-muted-foreground">{stream.description}</p></div>
            <section><h2 className="text-lg font-semibold mb-3">Live chat</h2><Comments liveStreamId={stream.id} /></section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Live;
