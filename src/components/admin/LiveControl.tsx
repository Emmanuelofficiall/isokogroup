import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { convertLiveToVideo } from "@/lib/videos";

const LiveControl = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => { if (user) fetchList(); }, [user]);

  const fetchList = async () => {
    const { data } = await supabase.from("live_streams").select("*").order("created_at", { ascending: false }).limit(50);
    setList(data || []);
  };

  const createLive = async () => {
    if (!user) return toast({ title: "Not signed in", variant: "destructive" });
    const { error } = await supabase.from("live_streams").insert({ title, description, category, thumbnail_url: thumbnail, created_by: user.id, status: "scheduled" });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Scheduled" });
    setTitle(""); setDescription(""); setThumbnail("");
    fetchList();
  };

  const startLive = async (id: string) => {
    const { error } = await supabase.from("live_streams").update({ status: "live", started_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast({ title: "Failed to start", description: error.message, variant: "destructive" });
    toast({ title: "Live started" });
    fetchList();
  };

  const endLive = async (id: string) => {
    try {
      const { data, error } = await convertLiveToVideo(id);
      if (error) {
        toast({ title: "Failed to convert live", description: (error as any).message || String(error), variant: "destructive" });
      } else {
        toast({ title: "Live ended and converted to video" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || String(e), variant: "destructive" });
    }
    fetchList();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-border rounded">
          <h3 className="font-semibold mb-2">Create / Schedule Live</h3>
          <input className="w-full p-2 border border-border rounded mb-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="w-full p-2 border border-border rounded mb-2" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input className="w-full p-2 border border-border rounded mb-2" placeholder="Thumbnail URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
          <textarea className="w-full p-2 border border-border rounded mb-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 bg-primary text-white rounded" onClick={createLive}>Create</button>
          </div>
        </div>

        <div className="p-4 border border-border rounded">
          <h3 className="font-semibold mb-2">Active / Scheduled Lives</h3>
          <div className="space-y-2">
            {list.map((l) => (
              <div key={l.id} className="p-2 border border-border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-muted-foreground">{l.status} • {l.category}</div>
                </div>
                <div className="flex gap-2">
                  {l.status !== "live" && <button className="px-3 py-1 border rounded" onClick={() => startLive(l.id)}>Start Live</button>}
                  {l.status === "live" && <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => endLive(l.id)}>END LIVE</button>}
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="text-sm text-muted-foreground">No scheduled lives</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveControl;
