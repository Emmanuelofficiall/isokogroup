import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import { fetchVideos } from "@/lib/videos";

const LatestVideos = ({ limit = 12 }: { limit?: number }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await fetchVideos({ limit });
      if (!error && mounted) setVideos(data ?? []);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [limit]);

  if (loading) return <div className="container py-8">Loading videos…</div>;
  if (!videos.length) return <div className="container py-8">No videos yet.</div>;

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">LATEST FROM ISOKO</h2>
        <a href="/videos" className="text-sm text-primary">View all →</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
};

export default LatestVideos;
