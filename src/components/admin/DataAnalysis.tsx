import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, ShoppingBag, Truck, Box, DollarSign, Download, FileText, FileSpreadsheet, FileType, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(0, 85%, 50%)", "hsl(220, 80%, 55%)", "hsl(140, 70%, 45%)",
  "hsl(45, 90%, 55%)", "hsl(260, 70%, 60%)", "hsl(190, 80%, 50%)",
];

const monthKey = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleString("default", { month: "short", year: "2-digit" });
};

const DataAnalysis = () => {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allLogistics, setAllLogistics] = useState<any[]>([]);
  const [allPackaging, setAllPackaging] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const inRange = (d: string) => {
    if (!dateRange?.from) return true;
    const t = new Date(d).getTime();
    if (isNaN(t)) return false;
    const from = new Date(dateRange.from); from.setHours(0, 0, 0, 0);
    const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
    to.setHours(23, 59, 59, 999);
    return t >= from.getTime() && t <= to.getTime();
  };

  const orders = useMemo(() => allOrders.filter((x) => inRange(x.created_at)), [allOrders, dateRange]);
  const logistics = useMemo(() => allLogistics.filter((x) => inRange(x.created_at)), [allLogistics, dateRange]);
  const packaging = useMemo(() => allPackaging.filter((x) => inRange(x.created_at)), [allPackaging, dateRange]);
  const profiles = useMemo(() => allProfiles.filter((x) => inRange(x.created_at)), [allProfiles, dateRange]);

  useEffect(() => {
    (async () => {
      const [o, l, p, pr, pd] = await Promise.all([
        (supabase as any).from("orders").select("*").limit(1000),
        (supabase as any).from("logistics_requests").select("*").limit(1000),
        (supabase as any).from("packaging_requests").select("*").limit(1000),
        (supabase as any).from("profiles").select("*").limit(1000),
        (supabase as any).from("products").select("*").limit(1000),
      ]);
      setAllOrders(o.data || []);
      setAllLogistics(l.data || []);
      setAllPackaging(p.data || []);
      setAllProfiles(pr.data || []);
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

  const reportRef = useRef<HTMLDivElement>(null);

  const exportCSV = () => {
    const lines: string[] = [];
    lines.push("KPIs", "Metric,Value,Note");
    kpis.forEach((k) => lines.push(`"${k.label}","${k.value}","${k.sub || ""}"`));
    lines.push("", "Monthly Breakdown", "Month,Orders,Revenue (RWF),Logistics,Packaging,New Users");
    monthly.forEach((m) => lines.push(`${m.month},${m.orders},${m.revenue},${m.logistics},${m.packaging},${m.users}`));
    lines.push("", "Service Mix", "Service,Count");
    serviceMix.forEach((s) => lines.push(`${s.name},${s.value}`));
    lines.push("", "Top Buyers", "Buyer,Spend (RWF),Orders");
    topBuyers.forEach((b) => lines.push(`"${b.name}",${b.spend},${b.count}`));
    lines.push("", "Order Status", "Status,Count");
    orderStatus.forEach((o) => lines.push(`${o.name},${o.value}`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpis.map((k) => ({ Metric: k.label, Value: k.value, Note: k.sub || "" }))), "KPIs");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthly), "Monthly");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(serviceMix), "ServiceMix");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topBuyers), "TopBuyers");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orderStatus), "OrderStatus");
    XLSX.writeFile(wb, `data-analysis-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel exported");
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    toast.info("Generating PDF…");
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 40;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 20;
    pdf.addImage(imgData, "PNG", 20, position, imgW, imgH);
    heightLeft -= pageH - 40;
    while (heightLeft > 0) {
      position = heightLeft - imgH + 20;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 20, position, imgW, imgH);
      heightLeft -= pageH - 40;
    }
    pdf.save(`data-analysis-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF exported");
  };

  if (loading) return <p className="text-muted-foreground">Loading data analysis…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2"><Download className="h-4 w-4" /> Export Report</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportPDF}><FileType className="h-4 w-4 mr-2" /> PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-2" /> Excel (.xlsx)</DropdownMenuItem>
            <DropdownMenuItem onClick={exportCSV}><FileText className="h-4 w-4 mr-2" /> CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={reportRef} className="space-y-6 bg-background p-2">
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
    </div>
  );
};

export default DataAnalysis;
