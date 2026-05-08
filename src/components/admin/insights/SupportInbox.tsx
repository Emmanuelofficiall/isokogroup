import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageSquare, CheckCircle } from "lucide-react";

const SupportInbox = () => {
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      (supabase as any).from("support_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, business_name"),
    ]);
    setItems(r || []);
    setProfiles(p || []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string, admin_feedback?: string) => {
    const patch: any = { status };
    if (admin_feedback !== undefined) patch.admin_feedback = admin_feedback;
    const { error } = await (supabase as any).from("support_requests").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };

  const label = (uid: string) => {
    const p = profiles.find((x) => x.user_id === uid);
    return p?.business_name || p?.full_name || uid.slice(0, 8);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Support Inbox ({items.length})</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No support requests yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{label(it.business_id)} · {it.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString()}</p>
              </div>
              <Badge variant={it.status === "resolved" ? "default" : it.status === "in_progress" ? "outline" : "destructive"}>{it.status}</Badge>
            </div>
            <p className="text-sm">{it.message}</p>
            <Textarea
              placeholder="Admin feedback…"
              defaultValue={it.admin_feedback || ""}
              onChange={(e) => setFeedback({ ...feedback, [it.id]: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => update(it.id, "in_progress", feedback[it.id] ?? it.admin_feedback)}>Mark In-Progress</Button>
              <Button size="sm" onClick={() => update(it.id, "resolved", feedback[it.id] ?? it.admin_feedback)} className="gap-1"><CheckCircle className="h-3 w-3" /> Resolve</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SupportInbox;
