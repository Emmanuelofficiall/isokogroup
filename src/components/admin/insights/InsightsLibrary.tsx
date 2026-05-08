import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Trash2 } from "lucide-react";

const InsightsLibrary = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const load = async () => {
    const [{ data: i }, { data: p }] = await Promise.all([
      (supabase as any).from("business_insights").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("user_id, full_name, business_name"),
    ]);
    setInsights(i || []);
    setProfiles(p || []);
  };
  useEffect(() => { load(); }, []);

  const send = async (id: string) => {
    const { error } = await (supabase as any).from("business_insights").update({ status: "sent" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Sent to client"); load(); }
  };
  const remove = async (id: string) => {
    await (supabase as any).from("business_insights").delete().eq("id", id);
    load();
  };

  const label = (uid: string) => {
    const p = profiles.find((x) => x.user_id === uid);
    return p?.business_name || p?.full_name || uid.slice(0, 8);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader><CardTitle className="text-base">All Insights ({insights.length})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {insights.length === 0 && <p className="text-sm text-muted-foreground">No insights generated yet.</p>}
        {insights.map((it) => (
          <div key={it.id} className="flex items-center justify-between border border-border rounded-lg p-3 text-sm">
            <div>
              <p className="font-medium">{it.title} <Badge variant={it.status === "sent" ? "default" : "outline"} className="ml-2">{it.status}</Badge></p>
              <p className="text-xs text-muted-foreground">{label(it.business_id)} · {new Date(it.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-1">
              {it.status !== "sent" && <Button size="sm" variant="outline" onClick={() => send(it.id)}><Send className="h-3 w-3 mr-1" /> Send</Button>}
              <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InsightsLibrary;
