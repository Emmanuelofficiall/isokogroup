import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, Lightbulb, MessageSquare } from "lucide-react";
import CountUp from "@/components/CountUp";

const ControlCenter = () => {
  const [stats, setStats] = useState({ businesses: 0, insights: 0, issues: 0, recsSent: 0, openSupport: 0 });

  useEffect(() => {
    (async () => {
      const [b, i, iss, r, s] = await Promise.all([
        (supabase as any).from("profiles").select("user_id", { count: "exact", head: true }),
        (supabase as any).from("business_insights").select("id", { count: "exact", head: true }),
        (supabase as any).from("detected_issues").select("id", { count: "exact", head: true }),
        (supabase as any).from("recommendations").select("id", { count: "exact", head: true }).eq("status", "sent"),
        (supabase as any).from("support_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({
        businesses: b.count || 0,
        insights: i.count || 0,
        issues: iss.count || 0,
        recsSent: r.count || 0,
        openSupport: s.count || 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Businesses Connected", value: stats.businesses, icon: Users, tone: "text-primary" },
    { label: "Reports Generated", value: stats.insights, icon: FileText, tone: "text-foreground" },
    { label: "Issues Detected", value: stats.issues, icon: AlertTriangle, tone: "text-insight-alert" },
    { label: "Recommendations Sent", value: stats.recsSent, icon: Lightbulb, tone: "text-insight-success" },
    { label: "Open Support Requests", value: stats.openSupport, icon: MessageSquare, tone: "text-insight-warn" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <Card key={c.label} className="hover-lift press" data-aos="fade-up" data-aos-delay={i * 60}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><c.icon className={`h-4 w-4 ${c.tone}`} /> {c.label}</div>
            <p className="text-2xl font-bold mt-1"><CountUp value={c.value} /></p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ControlCenter;
