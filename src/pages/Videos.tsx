import LatestVideos from "@/components/videos/LatestVideos";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { fetchVideos } from "@/lib/videos";
import VideoCard from "@/components/videos/VideoCard";

const Videos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 12;

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const load = async (more = false) => {
    setLoading(true);
    const res = await fetchVideos({ limit, offset: more ? offset : 0, search: search || null, category });
    if (!res.error) {
      const data = res.data || [];
      setVideos(more ? [...videos, ...data] : data);
      setOffset(more ? offset + data.length : data.length);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container">
          <div className="flex gap-4 mb-4">
            <input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 p-2 border border-border rounded" />
            <select value={category ?? ""} onChange={(e) => setCategory(e.target.value || null)} className="p-2 border border-border rounded">
              <option value="">All Categories</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Marketplace">Marketplace</option>
              <option value="Logistics">Logistics</option>
              <option value="Library">Library</option>
              <option value="Training">Training</option>
              <option value="News">News</option>
              <option value="Other">Other</option>
            </select>
            <button className="px-4 py-2 bg-primary text-white rounded" onClick={() => load(false)}>Search</button>
          </div>

          {loading && <div>Loading…</div>}

          {!loading && videos.length === 0 && <div className="text-muted-foreground">No videos found.</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>

          {videos.length >= limit && (
            <div className="flex justify-center mt-6">
              <button className="px-4 py-2 border rounded" onClick={() => load(true)}>Load more</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
