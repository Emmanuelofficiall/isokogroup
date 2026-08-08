import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const VideoManager = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(200);
    setVideos(data || []);
    setLoading(false);
  };

  const openEdit = (v: any) => setEditing({ ...v });
  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from("videos").update({ title: editing.title, description: editing.description, category: editing.category, thumbnail_url: editing.thumbnail_url, status: editing.status }).eq("id", editing.id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Video updated" });
    setEditing(null);
    fetchVideos();
  };

  const archiveVideo = async (id: string) => {
    if (!confirm("Archive this video?")) return;
    const { error } = await supabase.from("videos").update({ status: "archived" }).eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Archived" });
    fetchVideos();
  };

  const openComments = async (videoId: string) => {
    setShowCommentsFor(videoId);
    const { data } = await supabase.from("comments").select("id, user_id, body, created_at").eq("video_id", videoId).order("created_at", { ascending: true });
    setComments(data || []);
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setComments((s) => s.filter((c) => c.id !== id));
    toast({ title: "Comment deleted" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Videos ({videos.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div>Loading…</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell>{v.category}</TableCell>
                    <TableCell>{v.status}</TableCell>
                    <TableCell>{v.view_count}</TableCell>
                    <TableCell>{v.comments_count}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openEdit(v)}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => openComments(v.id)}>Comments</Button>
                        <Button size="sm" variant="destructive" onClick={() => archiveVideo(v.id)}>Archive</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-2">
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: (e.target as HTMLInputElement).value })} />
              <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: (e.target as HTMLInputElement).value })} />
              <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: (e.target as HTMLTextAreaElement).value })} />
              <Input value={editing.thumbnail_url} onChange={(e) => setEditing({ ...editing, thumbnail_url: (e.target as HTMLInputElement).value })} />
            </div>
          )}
          <DialogFooter>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showCommentsFor} onOpenChange={(open) => { if (!open) setShowCommentsFor(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-auto">
            {comments.map((c) => (
              <div key={c.id} className="p-2 border border-border rounded flex justify-between">
                <div>
                  <div className="text-sm font-medium">{c.user_id}</div>
                  <div className="text-xs text-muted-foreground">{c.body}</div>
                </div>
                <div>
                  <Button size="sm" variant="destructive" onClick={() => deleteComment(c.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCommentsFor(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoManager;
