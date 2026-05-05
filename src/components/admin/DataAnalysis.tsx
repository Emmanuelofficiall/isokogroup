import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, ShoppingBag, Truck, Box, DollarSign } from "lucide-react";

const COLORS = [
  "hsl(0, 85%, 50%)", "hsl(220, 80%, 55%)", "hsl(140, 70%, 45%)",
  "hsl(45, 90%, 55%)", "hsl(260, 70%, 60%)", "hsl(190, 80%, 50%)",
];

const monthKey = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleString("default", { month: "short", year: "2-digit" });
};

const DataAnalysis = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, l, p, pr, pd] = await Promise.all([
        (supabase as any).from("orders").select("*").limit(1000),
        (supabase as any).from("logistics_requests").select("*").limit(1000),
        (supabase as any).from("packaging_requests").select("*").limit(1000),
        (supabase as any).from("profiles").select("*").limit(1000),
        (supabase as any).from("products").select("*").limit(1000),
      ]);
      setOrders(o.data || []);
      setLogistics(l.data || []);
      setPackaging(p.data || []);
      setProfiles(pr.data || []);
      setProducts(pd.data || []);
      setLoading(false);
    })();
  }, []);

  const monthly = useMemo(() => {
    const map: Record<string, { month: string; orders: number; revenue: number; logistics: number; packaging: number; users: number }> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      map[key] = { month: key, orders: 0, revenue: 0, logistics: 0, packaging: 0, users: 0 };
    }
    orders.forEach((o) => {
      const k = monthKey(o.created_at);
      if (map[k]) { map[k].orders += 1; map[k].revenue += o.total_amount || 0; }
    });
    logistics.forEach((x) => { const k = monthKey(x.created_at); if (map[k]) map[k].logistics += 1; });
    packaging.forEach((x) => { const k = monthKey(x.created_at); if (map[k]) map[k].packaging += 1; });
    profiles.forEach((u) => { const k = monthKey(u.created_at); if (map[k]) map[k].users += 1; });
    return Object.values(map);
  }, [orders, logistics, packaging, profiles]);

  const serviceMix = useMemo(() => [
    { name: "Marketplace", value: orders.length },
    { name: "Logistics", value: logistics.length },
    { name: "Packaging", value: packaging.length },
  ].filter((x) => x.value > 0), [orders, logistics, packaging]);

  const topBuyers = useMemo(() => {
    const map: Record<string, { spend: number; count: number }> = {};
    orders.forEach((o) => {
      const k = o.buyer_id || "unknown";
      if (!map[k]) map[k] = { spend: 0, count: 0 };
      map[k].spend += o.total_amount || 0;
      map[k].count += 1;
    });
    return Object.entries(map)
      .map(([id, v]) => {
        const p = profiles.find((x) => x.user_id === id);
        return { name: p?.full_name || id.slice(0, 8), spend: v.spend, count: v.count };
      })
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8);
  }, [orders, profiles]);

  const orderStatus = useMemo(() => {
    const m: Record<string, number> = {};
    orders.forEach((o) => { m[o.status || "unknown"] = (m[o.status || "unknown"] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const aov = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const last30 = (arr: any[]) => arr.filter((x) => Date.now() - new Date(x.created_at).getTime() < 30 * 86400000).length;
  const prev30 = (arr: any[]) => arr.filter((x) => {
    const t = Date.now() - new Date(x.created_at).getTime();
    return t >= 30 * 86400000 && t < 60 * 86400000;
  }).length;
  const growth = (a: number, b: number) => b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100);

  const kpis = [
    { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} RWF`, icon: DollarSign },
    { label: "Avg Order Value", value: `${aov.toLocaleString()} RWF`, icon: TrendingUp },
    { label: "Orders 30d", value: last30(orders), sub: `${growth(last30(orders), prev30(orders))}% vs prev`, icon: ShoppingBag },
    { label: "New Users 30d", value: last30(profiles), sub: `${growth(last30(profiles), prev30(profiles))}% vs prev`, icon: Users },
    { label: "Logistics 30d", value: last30(logistics), icon: Truck },
    { label: "Packaging 30d", value: last30(packaging), icon: Box },
  ];

  if (loading) return <p className="text-muted-foreground">Loading data analysis…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <k.icon className="h-4 w-4" /> {k.label}
              </div>
              <p className="text-lg font-bold mt-1">{k.value}</p>
              {k.sub && <p className="text-[11px] text-muted-foreground">{k.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">12-Month Revenue Trend (RWF)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Service Volume Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Line type="monotone" dataKey="orders" stroke={COLORS[0]} strokeWidth={2} />
                <Line type="monotone" dataKey="logistics" stroke={COLORS[1]} strokeWidth={2} />
                <Line type="monotone" dataKey="packaging" stroke={COLORS[2]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">User Acquisition</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Bar dataKey="users" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Service Mix</CardTitle></CardHeader>
          <CardContent>
            {serviceMix.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={serviceMix} dataKey="value" nameKey="name" outerRadius={100} label>
                    {serviceMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">No data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Top Buyers by Spend</CardTitle></CardHeader>
          <CardContent>
            {topBuyers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBuyers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" /><YAxis type="category" dataKey="name" width={100} /><Tooltip />
                  <Bar dataKey="spend" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">No buyer data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Order Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {orderStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={orderStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                    {orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">No order data</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataAnalysis;
