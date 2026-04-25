import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Mic, Search, Play, Upload, Trash2, Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useAuth } from "@/lib/auth";

type EntItem = {
  id: string;
  title: string;
  creator: string;
  type: "film" | "podcast";
  category: string;
  description: string | null;
  price: number;
  cover_url: string | null;
  media_url: string | null;
  duration_minutes: number;
  trending: boolean;
};

const Entertainment = () => {
  const [items, setItems] = useState<EntItem[]>([]);
  const [tab, setTab] = useState<"all" | "film" | "podcast">("all");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<EntItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();
  const { user } = useAuth();

  // Form state
  const [form, setForm] = useState({
    title: "",
    creator: "",
    type: "film" as "film" | "podcast",
    category: "trending",
    description: "",
    price: 0,
    duration: 0,
    trending: true,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("entertainment")
      .select("*")
      .order("trending", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) setItems(data as EntItem[]);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items
    .filter((i) => tab === "all" || i.type === tab)
    .filter(
      (i) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.creator.toLowerCase().includes(search.toLowerCase())
    );

  const uploadToBucket = async (file: File, prefix: string) => {
    const ext = file.name.split(".").pop();
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("entertainment").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("entertainment").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.creator.trim()) {
      toast({ title: "Missing fields", description: "Title and creator are required.", variant: "destructive" });
      return;
    }
    if (!mediaFile) {
      toast({ title: "Media file required", description: "Upload a video or audio file.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const cover_url = coverFile ? await uploadToBucket(coverFile, "covers") : null;
      const media_url = await uploadToBucket(mediaFile, "media");
      const { error } = await supabase.from("entertainment").insert({
        title: form.title.trim(),
        creator: form.creator.trim(),
        type: form.type,
        category: form.category.trim() || "trending",
        description: form.description.trim() || null,
        price: Number(form.price) || 0,
        cover_url,
        media_url,
        duration_minutes: Number(form.duration) || 0,
        trending: form.trending,
      });
      if (error) throw error;
      toast({ title: "Uploaded", description: `${form.title} is now live.` });
      setForm({ title: "", creator: "", type: "film", category: "trending", description: "", price: 0, duration: 0, trending: true });
      setCoverFile(null);
      setMediaFile(null);
      fetchItems();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("entertainment").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Removed" });
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-10 space-y-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Entertainment</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Trending Films & Podcasts</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stream curated films and podcasts from creators across the region.
            </p>
          </div>

          {isAdmin && (
            <Card className="mb-10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-primary" /> Admin: Upload film or podcast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ent-title">Title</Label>
                    <Input id="ent-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ent-creator">Creator</Label>
                    <Input id="ent-creator" value={form.creator} onChange={(e) => setForm({ ...form, creator: e.target.value })} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v: "film" | "podcast") => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="film">Film</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ent-cat">Category</Label>
                    <Input id="ent-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="trending, drama, tech..." />
                  </div>
                  <div>
                    <Label htmlFor="ent-price">Price (RWF)</Label>
                    <Input id="ent-price" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label htmlFor="ent-dur">Duration (minutes)</Label>
                    <Input id="ent-dur" type="number" min={0} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="ent-desc">Description</Label>
                    <Textarea id="ent-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ent-cover">Cover image</Label>
                    <Input id="ent-cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  </div>
                  <div>
                    <Label htmlFor="ent-media">Media file (video/audio)</Label>
                    <Input id="ent-media" type="file" accept="video/*,audio/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
                  </div>
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} />
                    Mark as trending
                  </label>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={uploading} className="w-full md:w-auto">
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="max-w-md mx-auto relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search films or podcasts..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex justify-center gap-2 mb-10">
            {(["all", "film", "podcast"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {t === "all" ? "All" : t + "s"}
              </button>
            ))}
          </div>

          {playing && (
            <div className="mb-8 rounded-xl border border-border bg-card p-4 md:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3 gap-3">
                <h2 className="text-lg font-bold flex items-center gap-2 min-w-0">
                  {playing.type === "film" ? <Film className="h-5 w-5 text-primary" /> : <Mic className="h-5 w-5 text-primary" />}
                  <span className="truncate">{playing.title}</span>
                </h2>
                <Button variant="outline" size="sm" onClick={() => setPlaying(null)}>Close</Button>
              </div>
              {playing.media_url && (
                playing.type === "film" ? (
                  <video src={playing.media_url} controls className="w-full rounded-lg bg-black aspect-video" />
                ) : (
                  <audio src={playing.media_url} controls className="w-full" />
                )
              )}
            </div>
          )}

          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground col-span-full py-10">No items yet.</p>
            )}
            {filtered.map((item) => (
              <div key={item.id} className="group rounded-xl border border-border bg-card p-5 hover-lift">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                  {item.cover_url ? (
                    <img src={item.cover_url} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === "film" ? <Film className="h-12 w-12 text-muted-foreground" /> : <Mic className="h-12 w-12 text-muted-foreground" />}
                    </div>
                  )}
                  {item.trending && (
                    <Badge className="absolute top-2 left-2 gap-1 bg-primary text-primary-foreground">
                      <Flame className="h-3 w-3" /> Trending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium capitalize">{item.type} · {item.category}</span>
                  <span className="text-xs text-muted-foreground">{item.duration_minutes}m</span>
                </div>
                <h3 className="font-semibold text-sm mt-1 truncate">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">by {item.creator}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold text-primary">{item.price > 0 ? `${item.price} RWF` : "Free"}</span>
                  <div className="flex gap-1">
                    {isAdmin && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} aria-label="Delete">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setPlaying(item)} disabled={!item.media_url}>
                      <Play className="h-3 w-3" /> Play
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Entertainment;
