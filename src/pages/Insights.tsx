import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AlertTriangle, CheckCircle2, Lightbulb, Download, MessageSquare, FileText, BarChart3, LifeBuoy, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

const Insights = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [supports, setSupports] = useState<any[]>([]);
  const [supportType, setSupportType] = useState("analysis");
  const [supportMsg, setSupportMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: i }, { data: iss }, { data: r }, { data: o }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        (supabase as any).from("business_insights").select("*").eq("business_id", user.id).order("created_at", { ascending: false }),
        (supabase as any).from("detected_issues").select("*").eq("business_id", user.id).order("created_at", { ascending: false }),
        (supabase as any).from("recommendations").select("*").eq("business_id", user.id).order("created_at", { ascending: false }),
        (supabase as any).from("orders").select("*").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(500),
        (supabase as any).from("support_requests").select("*").eq("business_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setInsights(i || []);
      setIssues(iss || []);
      setRecs(r || []);
      setOrders(o || []);
      setSupports(s || []);
    })();
  }, [user]);

  const latest = insights[0];
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const todaySales = todayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const openIssues = issues.filter((i) => latest && i.insight_id === latest.id);

  const trend = useMemo(() => {
    const map: Record<string, { day: string; sales: number }> = {};
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const k = d.toLocaleDateString("default", { month: "short", day: "numeric" });
      map[k] = { day: k, sales: 0 };
    }
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      if (now - d.getTime() < 30 * 86400000) {
        const k = d.toLocaleDateString("default", { month: "short", day: "numeric" });
        if (map[k]) map[k].sales += o.total_amount || 0;
      }
    });
    return Object.values(map);
  }, [orders]);

  const submitSupport = async () => {
    if (!supportMsg.trim()) { toast.error("Write a message"); return; }
    const { error } = await (supabase as any).from("support_requests").insert({
      business_id: user!.id, type: supportType, message: supportMsg.trim(),
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Request sent to admin");
      setSupportMsg("");
      const { data: s } = await (supabase as any).from("support_requests").select("*").eq("business_id", user!.id).order("created_at", { ascending: false });
      setSupports(s || []);
    }
  };

  const exportInsightPdf = async (insight: any) => {
    toast.info("Generating PDF…");
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const lineH = 18;
    let y = 40;
    doc.setFontSize(18); doc.text(insight.title || "Business Analysis Report", 40, y); y += lineH * 1.5;
    doc.setFontSize(11);
    doc.text(`Period: ${insight.period_start || "—"} to ${insight.period_end || "—"}`, 40, y); y += lineH;
    doc.text(`Generated: ${new Date(insight.created_at).toLocaleString()}`, 40, y); y += lineH * 1.5;

    doc.setFontSize(14); doc.text("Summary", 40, y); y += lineH;
    doc.setFontSize(11);
    Object.entries(insight.summary || {}).forEach(([k, v]) => { doc.text(`• ${k}: ${v}`, 50, y); y += lineH; });

    const insIssues = issues.filter((i) => i.insight_id === insight.id);
    if (insIssues.length) {
      y += lineH * 0.5; doc.setFontSize(14); doc.text("Detected Issues & Root Causes", 40, y); y += lineH;
      doc.setFontSize(11);
      insIssues.forEach((i) => {
        doc.text(`• [${i.severity}] ${i.title}`, 50, y); y += lineH;
        if (i.root_cause) { doc.text(`   → ${i.root_cause}`, 60, y); y += lineH; }
        if (y > 760) { doc.addPage(); y = 40; }
      });
    }
    const insRecs = recs.filter((r) => r.insight_id === insight.id);
    if (insRecs.length) {
      y += lineH * 0.5; doc.setFontSize(14); doc.text("Recommendations", 40, y); y += lineH;
      doc.setFontSize(11);
      insRecs.forEach((r) => {
        doc.text(`✔ ${r.title}`, 50, y); y += lineH;
        if (r.body) { doc.text(`   ${r.body}`, 60, y); y += lineH; }
        if (y > 760) { doc.addPage(); y = 40; }
      });
    }
    doc.save(`insight-${insight.id.slice(0, 8)}.pdf`);
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold">👋 Welcome, {profile?.business_name || profile?.full_name || "Business"}</h1>
          <p className="text-muted-foreground mt-1">Isoko Data Insights & Business Support</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="dashboard"><LayoutDashboard className="h-4 w-4 mr-1 hidden sm:inline" /> Dashboard</TabsTrigger>
            <TabsTrigger value="reports"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> Reports</TabsTrigger>
            <TabsTrigger value="insights"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Insights</TabsTrigger>
            <TabsTrigger value="support"><LifeBuoy className="h-4 w-4 mr-1 hidden sm:inline" /> Support</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Today's Sales</p><p className="text-xl font-bold">{todaySales.toLocaleString()} RWF</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Today's Orders</p><p className="text-xl font-bold">{todayOrders.length}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Issues Detected</p><p className="text-xl font-bold text-insight-alert flex items-center gap-1">{openIssues.length} {openIssues.length > 0 && <AlertTriangle className="h-4 w-4" />}</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">📉 Performance — Sales over last 30 days</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" /><YAxis /><Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-insight-alert" /> Key Problems</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {openIssues.length === 0 && <p className="text-sm text-muted-foreground">No issues reported.</p>}
                  {openIssues.slice(0, 5).map((i) => (
                    <div key={i.id} className="flex items-start gap-2 text-sm">
                      <span className="h-2 w-2 mt-1.5 rounded-full bg-insight-alert shrink-0" />
                      <div><p className="font-medium">{i.title}</p>{i.root_cause && <p className="text-xs text-muted-foreground">{i.root_cause}</p>}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-insight-success" /> Recommendations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {recs.length === 0 && <p className="text-sm text-muted-foreground">No recommendations yet.</p>}
                  {recs.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-insight-success mt-0.5 shrink-0" />
                      <div><p className="font-medium">{r.title}</p>{r.body && <p className="text-xs text-muted-foreground">{r.body}</p>}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">📈 Reports</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {insights.length === 0 && <p className="text-sm text-muted-foreground">No reports available yet.</p>}
                {insights.map((it) => (
                  <div key={it.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{it.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString()} · {it.period_start || "—"} → {it.period_end || "—"}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => exportInsightPdf(it)} className="gap-1"><Download className="h-3 w-3" /> PDF</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {!latest && <Card><CardContent className="p-6 text-center text-muted-foreground">Your detailed analysis will appear here once admin generates an insight.</CardContent></Card>}
            {latest && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 {latest.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">Period: {latest.period_start || "—"} → {latest.period_end || "—"}</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <section>
                    <h3 className="font-semibold mb-2">📉 Data Insights</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(latest.summary || {}).map(([k, v]) => (
                        <div key={k} className="border border-border rounded p-2">
                          <p className="text-xs text-muted-foreground capitalize">{k}</p>
                          <p className="font-bold">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-insight-alert" /> Root Cause Analysis</h3>
                    {openIssues.length === 0 && <p className="text-sm text-muted-foreground">None.</p>}
                    <ul className="space-y-2">
                      {openIssues.map((i) => (
                        <li key={i.id} className="border-l-2 border-insight-alert pl-3 text-sm">
                          <p className="font-medium">{i.title} <Badge variant="outline" className="ml-1">{i.severity}</Badge></p>
                          {i.root_cause && <p className="text-muted-foreground text-xs mt-0.5">→ {i.root_cause}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-insight-success" /> Suggested Actions</h3>
                    <ul className="space-y-2">
                      {recs.filter((r) => r.insight_id === latest.id).map((r) => (
                        <li key={r.id} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-insight-success mt-0.5 shrink-0" />
                          <div><p className="font-medium">{r.title}</p>{r.body && <p className="text-xs text-muted-foreground">{r.body}</p>}</div>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <Button onClick={() => exportInsightPdf(latest)} className="gap-2"><Download className="h-4 w-4" /> Download Report</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Business Support</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Need help improving your business? Tell admin what you need.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "analysis", l: "Request Analysis" },
                    { v: "marketing", l: "Marketing Help" },
                    { v: "logistics", l: "Logistics Help" },
                    { v: "other", l: "Other" },
                  ].map((b) => (
                    <Button key={b.v} size="sm" variant={supportType === b.v ? "default" : "outline"} onClick={() => setSupportType(b.v)}>{b.l}</Button>
                  ))}
                </div>
                <Textarea placeholder="Describe what you need…" value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} />
                <Button onClick={submitSupport}>Send to Admin</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Your Requests & Admin Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {supports.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
                {supports.map((s) => (
                  <div key={s.id} className="border border-border rounded-lg p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{s.type}</p>
                      <Badge variant={s.status === "resolved" ? "default" : "outline"}>{s.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                    <p>{s.message}</p>
                    {s.admin_feedback && (
                      <div className="mt-2 p-2 rounded bg-muted text-sm">
                        <p className="text-xs text-muted-foreground mb-0.5">📩 Admin feedback</p>
                        {s.admin_feedback}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Insights;
