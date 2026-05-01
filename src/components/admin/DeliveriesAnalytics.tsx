import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  processing: "hsl(45, 90%, 55%)",
  packed: "hsl(200, 80%, 55%)",
  shipped: "hsl(220, 80%, 55%)",
  in_transit: "hsl(260, 70%, 60%)",
  out_for_delivery: "hsl(30, 90%, 55%)",
  delivered: "hsl(140, 70%, 45%)",
};

const DeliveriesAnalytics = () => {
  const [byStatus, setByStatus] = useState<{ name: string; value: number; fill: string }[]>([]);
  const [byCourier, setByCourier] = useState<{ courier: string; shipments: number }[]>([]);
  const [byDay, setByDay] = useState<{ day: string; shipped: number; delivered: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: ships } = await (supabase as any)
        .from("shipments").select("status, courier, created_at, updated_at").limit(1000);
      const list = (ships ?? []) as any[];

      const sCount: Record<string, number> = {};
      list.forEach((s) => { sCount[s.status] = (sCount[s.status] || 0) + 1; });
      setByStatus(Object.entries(sCount).map(([k, v]) => ({
        name: k.replace(/_/g, " "), value: v, fill: STATUS_COLORS[k] ?? "hsl(0,0%,50%)",
      })));

      const cCount: Record<string, number> = {};
      list.forEach((s) => {
        const k = s.courier?.trim() || "Unassigned";
        cCount[k] = (cCount[k] || 0) + 1;
      });
      setByCourier(
        Object.entries(cCount)
          .map(([courier, shipments]) => ({ courier, shipments }))
          .sort((a, b) => b.shipments - a.shipments)
          .slice(0, 8)
      );

      const days: Record<string, { shipped: number; delivered: number }> = {};
      const now = Date.now();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const key = d.toISOString().slice(5, 10);
        days[key] = { shipped: 0, delivered: 0 };
      }
      list.forEach((s) => {
        const key = (s.created_at ?? "").slice(5, 10);
        if (days[key]) days[key].shipped += 1;
        if (s.status === "delivered") {
          const dkey = (s.updated_at ?? "").slice(5, 10);
          if (days[dkey]) days[dkey].delivered += 1;
        }
      });
      setByDay(Object.entries(days).map(([day, v]) => ({ day, ...v })));
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Shipments by Status</CardTitle></CardHeader>
        <CardContent>
          {byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                  {byStatus.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-12">No shipments yet</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Top Couriers</CardTitle></CardHeader>
        <CardContent>
          {byCourier.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCourier}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                <XAxis dataKey="courier" /><YAxis /><Tooltip />
                <Bar dataKey="shipments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-12">No courier data</p>}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-lg">Last 7 Days — Shipped vs Delivered</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
              <XAxis dataKey="day" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="shipped" fill="hsl(220, 80%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" fill="hsl(140, 70%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveriesAnalytics;
