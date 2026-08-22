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
  const [streamUrl, setStreamUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { if (user) fetchList(); }, [user]);

  const fetchList = async () => {
    const { data } = await supabase.from("live_streams").select("*").order("created_at", { ascending: false }).limit(50);
    setList(data || []);
  };

  const createLive = async () => {
    if (!user) return toast({ title: "Not signed in", variant: "destructive" });
    try {
      if (!title.trim()) {
        toast({ title: "Title required", variant: "destructive" });
        return;
      }
      if (!thumbnailFile) {
        toast({ title: "Thumbnail required", description: "Upload a thumbnail image first.", variant: "destructive" });
        return;
      }
      const extension = thumbnailFile.name.split(".").pop() || "jpg";
      const storagePath = `live/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("thumbnails").upload(storagePath, thumbnailFile, {
        contentType: thumbnailFile.type || "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });
      if (uploadError) {
        const description = uploadError.message.toLowerCase().includes("bucket not found")
          ? "Create the thumbnails bucket in Supabase Storage, then try again."
          : uploadError.message;
        toast({ title: "Thumbnail upload failed", description, variant: "destructive" });
        return;
      }
      const { data: publicUrl } = supabase.storage.from("thumbnails").getPublicUrl(storagePath);
      const thumbnail_url = publicUrl.publicUrl;

      const { error } = await supabase.from("live_streams").insert({
        title: title.trim(), description: description.trim() || null, category,
        thumbnail_url, stream_url: streamUrl.trim() || null, created_by: user.id, status: "scheduled",
      });
      if (error) throw error;
      toast({ title: "Scheduled" });
      setTitle(""); setDescription(""); setStreamUrl(""); setThumbnailFile(null); setPreviewUrl(null);
      fetchList();
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const handleThumbnailFile = (file?: File) => {
    if (!file) return;
    setThumbnailFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const startLive = async (id: string) => {
    // Keep the homepage unambiguous: only one stream can be live at a time.
    const { error: endPreviousError } = await supabase
      .from("live_streams")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("status", "live")
      .neq("id", id);
    if (endPreviousError) {
      return toast({ title: "Failed to start", description: endPreviousError.message, variant: "destructive" });
    }

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
    if (data) {
      const { data: users } = await supabase.from("profiles").select("user_id").neq("user_id", user?.id ?? "");
      if (users?.length) {
        await (supabase as any).from("notifications").insert(users.map((recipient: { user_id: string }) => ({
          user_id: recipient.user_id,
          title: "ISOKO GROUP is Live Now — Join the Live",
          body: `Join ${data.title} now.`,
          type: "info",
          link: `/live/${data.id}`,
        })));
      }
      // Email delivery runs server-side so the service-role key never reaches the browser.
      const { error: emailError } = await supabase.functions.invoke("notify-live", {
        body: { liveId: data.id, title: data.title, link: `${window.location.origin}/live/${data.id}` },
      });
      if (emailError) console.warn("Live email notification unavailable:", emailError.message);
    }
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
          <label className="block text-sm mb-1">Thumbnail image *</label>
          <input type="file" accept="image/*" className="w-full p-2 border border-border rounded mb-2" onChange={(event) => handleThumbnailFile(event.target.files?.[0])} />
          <input className="w-full p-2 border border-border rounded mb-2" placeholder="Live URL (YouTube, Vimeo, or HLS)" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} />
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
