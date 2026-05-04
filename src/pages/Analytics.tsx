import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Truck, Box, DollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["hsl(0, 85%, 50%)", "hsl(220, 80%, 55%)", "hsl(140, 70%, 45%)", "hsl(45, 90%, 55%)", "hsl(260, 70%, 60%)"];

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [o, l, p] = await Promise.all([
        (supabase as any).from("orders").select("*").eq("buyer_id", user.id),
        (supabase as any).from("logistics_requests").select("*").eq("user_id", user.id),
        (supabase as any).from("packaging_requests").select("*").eq("user_id", user.id),
      ]);
      setOrders(o.data || []);
      setLogistics(l.data || []);
      setPackaging(p.data || []);
      setLoading(false);
    })();
  }, [user]);

  const totalSpend = useMemo(
    () => orders.reduce((s, o) => s + (o.total_amount || 0), 0),
    [orders]
  );

  const monthly = useMemo(() => {
    const map: Record<string, { month: string; orders: number; spend: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      map[key] = { month: key, orders: 0, spend: 0 };
    }
    orders.forEach((o) => {
      const k = new Date(o.created_at).toLocaleString("default", { month: "short" });
      if (map[k]) {
        map[k].orders += 1;
        map[k].spend += o.total_amount || 0;
      }
    });
    return Object.values(map);
  }, [orders]);

  const byActivity = useMemo(
    () => [
      { name: "Marketplace", value: orders.length },
      { name: "Deliveries", value: logistics.length },
      { name: "Packaging", value: packaging.length },
    ].filter((x) => x.value > 0),
    [orders, logistics, packaging]
  );

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const stats = [
    { label: "Marketplace Orders", value: orders.length, icon: ShoppingBag },
    { label: "Delivery Requests", value: logistics.length, icon: Truck },
    { label: "Packaging Requests", value: packaging.length, icon: Box },
    { label: "Total Spend", value: `${totalSpend.toLocaleString()} RWF`, icon: DollarSign },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-bold">My Analytics</h1>
          <p className="text-muted-foreground mt-2">Insights into your activity across ISOKO GROUP.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <Card key={s.label} className="hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Last 6 months — Orders</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" /><YAxis /><Tooltip />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Last 6 months — Spend (RWF)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" /><YAxis /><Tooltip />
                    <Line type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-lg">Activity breakdown</CardTitle></CardHeader>
              <CardContent>
                {byActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={byActivity} dataKey="value" nameKey="name" outerRadius={100} label>
                        {byActivity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No activity yet — start using ISOKO services to see insights.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;
