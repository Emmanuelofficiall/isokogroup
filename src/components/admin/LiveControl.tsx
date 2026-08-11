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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { if (user) fetchList(); }, [user]);

  const fetchList = async () => {
    const { data } = await supabase.from("live_streams").select("*").order("created_at", { ascending: false }).limit(50);
    setList(data || []);
  };

  const createLive = async () => {
    if (!user) return toast({ title: "Not signed in", variant: "destructive" });
    let thumbnail_url = thumbnail || null;
    try {
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const key = `thumbnails/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("thumbnails").upload(key, file, { upsert: true });
        if (uploadError) {
          console.error("thumbnail upload error:", uploadError);
          // Friendly guidance if bucket missing, but do not block creation if admin provided a pasted URL
          if ((uploadError.message || "").toLowerCase().includes("bucket not found")) {
            toast({ title: "Upload failed", description: "Storage bucket 'thumbnails' not found. Create the bucket in Supabase or paste a thumbnail URL.", variant: "destructive" });
          } else {
            toast({ title: "Upload failed", description: String(uploadError), variant: "destructive" });
          }
          // proceed without upload (use pasted thumbnail if any)
        } else {
          const { data: urlData } = await supabase.storage.from("thumbnails").getPublicUrl(key);
          thumbnail_url = (urlData as any)?.publicUrl || thumbnail_url;
        }
      }

      const { error } = await supabase.from("live_streams").insert({ title, description, category, thumbnail_url, created_by: user.id, status: "scheduled" });
      if (error) throw error;
      toast({ title: "Scheduled" });
      setTitle(""); setDescription(""); setThumbnail(""); setFile(null); setPreviewUrl(null);
      fetchList();
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const handleFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    try {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } catch (e) {
      setPreviewUrl(null);
    }
  };

  const startLive = async (id: string) => {
    console.debug("startLive: updating live_streams", id);
    const { data, error } = await supabase
      .from("live_streams")
      .update({ status: "live", started_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) {
      console.error("startLive error:", error);
      return toast({ title: "Failed to start", description: error.message, variant: "destructive" });
    }
    console.debug("startLive result:", data);
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
          <div className="mb-2">
            <label className="text-sm">Or upload thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) handleFile(f);
              }}
              className="w-full mt-1"
            />
          </div>
          {previewUrl && (
            <div className="mb-2">
              <img src={previewUrl} alt="preview" className="w-48 h-auto rounded" />
            </div>
          )}
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
