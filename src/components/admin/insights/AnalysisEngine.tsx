import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend,
} from "recharts";
import { Brain, Send, Plus, Trash2, AlertTriangle, Lightbulb } from "lucide-react";

type Profile = { user_id: string; full_name: string | null; business_name: string | null };

const monthKey = (d: string) => new Date(d).toLocaleString("default", { month: "short", year: "2-digit" });

const AnalysisEngine = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [businessId, setBusinessId] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");

  const [orders, setOrders] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);

  const [issues, setIssues] = useState<{ title: string; severity: string; category: string; root_cause: string }[]>([]);
  const [recs, setRecs] = useState<{ title: string; body: string }[]>([]);
  const [insightTitle, setInsightTitle] = useState("Business Analysis Report");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, business_name").order("created_at", { ascending: false });
      setProfiles(data || []);
    })();
  }, []);

  useEffect(() => {
    if (!businessId) return;
    (async () => {
      const [o, l, p] = await Promise.all([
        (supabase as any).from("orders").select("*").or(`buyer_id.eq.${businessId},seller_id.eq.${businessId}`).limit(1000),
        (supabase as any).from("logistics_requests").select("*").eq("user_id", businessId).limit(1000),
        (supabase as any).from("packaging_requests").select("*").eq("user_id", businessId).limit(1000),
      ]);
      setOrders(o.data || []);
      setLogistics(l.data || []);
      setPackaging(p.data || []);
    })();
  }, [businessId]);

  const inRange = (d: string) => {
    if (!periodStart && !periodEnd) return true;
    const t = new Date(d).getTime();
    if (periodStart && t < new Date(periodStart).getTime()) return false;
    if (periodEnd && t > new Date(periodEnd).getTime() + 86400000) return false;
    return true;
  };

  const fOrders = useMemo(() => orders.filter((x) => inRange(x.created_at)), [orders, periodStart, periodEnd]);
  const fLog = useMemo(() => logistics.filter((x) => inRange(x.created_at)), [logistics, periodStart, periodEnd]);
  const fPack = useMemo(() => packaging.filter((x) => inRange(x.created_at)), [packaging, periodStart, periodEnd]);

  const monthly = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; orders: number; logistics: number; packaging: number }> = {};
    fOrders.forEach((o) => {
      const k = monthKey(o.created_at);
      if (!map[k]) map[k] = { month: k, revenue: 0, orders: 0, logistics: 0, packaging: 0 };
      map[k].orders += 1; map[k].revenue += o.total_amount || 0;
    });
    fLog.forEach((x) => { const k = monthKey(x.created_at); map[k] = map[k] || { month: k, revenue: 0, orders: 0, logistics: 0, packaging: 0 }; map[k].logistics += 1; });
    fPack.forEach((x) => { const k = monthKey(x.created_at); map[k] = map[k] || { month: k, revenue: 0, orders: 0, logistics: 0, packaging: 0 }; map[k].packaging += 1; });
    return Object.values(map);
  }, [fOrders, fLog, fPack]);

  const totalRevenue = fOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const lateDeliveries = fLog.filter((x) => x.status === "pending" || x.status === "assigned").length;
  const refunds = fOrders.filter((o) => o.status === "cancelled" || o.status === "refunded").length;

  const runAutoDetect = () => {
    const detected: typeof issues = [];
    if (fOrders.length === 0) {
      detected.push({ title: "No sales recorded", severity: "high", category: "sales", root_cause: "No orders in selected period — visibility, marketing, or product availability issue." });
    }
    if (lateDeliveries > 0) {
      detected.push({ title: `${lateDeliveries} delayed deliveries`, severity: lateDeliveries > 3 ? "high" : "medium", category: "logistics", root_cause: "Logistics requests still pending or only assigned — driver capacity or scheduling." });
    }
    if (refunds > 0) {
      detected.push({ title: `${refunds} cancellations/refunds`, severity: "medium", category: "quality", root_cause: "Possible product quality, fulfillment, or customer expectation issue." });
    }
    setIssues(detected);
    toast.success(`Detected ${detected.length} issue(s)`);
  };

  const addIssue = () => setIssues([...issues, { title: "", severity: "medium", category: "", root_cause: "" }]);
  const addRec = () => setRecs([...recs, { title: "", body: "" }]);

  const saveAndSend = async (status: "draft" | "sent") => {
    if (!businessId) { toast.error("Pick a business"); return; }
    const summary = { revenue: totalRevenue, orders: fOrders.length, logistics: fLog.length, packaging: fPack.length, refunds, late: lateDeliveries };
    const { data: insight, error } = await (supabase as any)
      .from("business_insights")
      .insert({
        business_id: businessId,
        title: insightTitle,
        period_start: periodStart || null,
        period_end: periodEnd || null,
        summary,
        trends: { monthly },
        status,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }

    if (issues.length) {
      await (supabase as any).from("detected_issues").insert(
        issues.filter((i) => i.title.trim()).map((i) => ({ ...i, insight_id: insight.id, business_id: businessId }))
      );
    }
    if (recs.length) {
      await (supabase as any).from("recommendations").insert(
        recs.filter((r) => r.title.trim()).map((r) => ({ ...r, insight_id: insight.id, business_id: businessId, status }))
      );
    }
    toast.success(status === "sent" ? "Insight sent to client" : "Insight saved as draft");
    setIssues([]); setRecs([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Analysis Engine</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label>Select Business</Label>
              <Select value={businessId} onValueChange={setBusinessId}>
                <SelectTrigger><SelectValue placeholder="Choose a business…" /></SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      {p.business_name || p.full_name || p.user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Period start</Label><Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></div>
            <div><Label>Period end</Label><Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {businessId && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Revenue</p><p className="text-lg font-bold">{totalRevenue.toLocaleString()} RWF</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Orders</p><p className="text-lg font-bold">{fOrders.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Logistics</p><p className="text-lg font-bold">{fLog.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Packaging</p><p className="text-lg font-bold">{fPack.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Late / Refunds</p><p className="text-lg font-bold text-insight-alert">{lateDeliveries} / {refunds}</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" /><YAxis /><Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Service Volume</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" />
                    <Bar dataKey="logistics" fill="hsl(var(--insight-warn))" />
                    <Bar dataKey="packaging" fill="hsl(var(--insight-success))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-insight-alert" /> Detected Issues & Root Causes</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={runAutoDetect}>Auto-detect</Button>
                <Button size="sm" variant="outline" onClick={addIssue}><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues yet. Run auto-detect or add manually.</p>}
              {issues.map((iss, i) => (
                <div key={i} className="border border-border rounded-lg p-3 grid grid-cols-1 md:grid-cols-12 gap-2 animate-fade-in">
                  <Input className="md:col-span-4" placeholder="Issue title" value={iss.title} onChange={(e) => { const c = [...issues]; c[i].title = e.target.value; setIssues(c); }} />
                  <Select value={iss.severity} onValueChange={(v) => { const c = [...issues]; c[i].severity = v; setIssues(c); }}>
                    <SelectTrigger className="md:col-span-2"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                  </Select>
                  <Input className="md:col-span-2" placeholder="Category" value={iss.category} onChange={(e) => { const c = [...issues]; c[i].category = e.target.value; setIssues(c); }} />
                  <Input className="md:col-span-3" placeholder="Root cause" value={iss.root_cause} onChange={(e) => { const c = [...issues]; c[i].root_cause = e.target.value; setIssues(c); }} />
                  <Button size="icon" variant="ghost" onClick={() => setIssues(issues.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4 text-insight-success" /> Recommendations</CardTitle>
              <Button size="sm" variant="outline" onClick={addRec}><Plus className="h-3 w-3 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recs.length === 0 && <p className="text-sm text-muted-foreground">Add advice items to share with the client.</p>}
              {recs.map((r, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2 animate-fade-in">
                  <Input placeholder="Recommendation title" value={r.title} onChange={(e) => { const c = [...recs]; c[i].title = e.target.value; setRecs(c); }} />
                  <Textarea placeholder="Details / how to apply" value={r.body} onChange={(e) => { const c = [...recs]; c[i].body = e.target.value; setRecs(c); }} />
                  <Button size="sm" variant="ghost" onClick={() => setRecs(recs.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label>Insight title</Label>
                <Input value={insightTitle} onChange={(e) => setInsightTitle(e.target.value)} />
              </div>
              <Button variant="outline" onClick={() => saveAndSend("draft")}>Save Draft</Button>
              <Button onClick={() => saveAndSend("sent")} className="gap-2"><Send className="h-4 w-4" /> Send to Client</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalysisEngine;
