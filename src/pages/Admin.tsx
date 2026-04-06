import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Users, ShoppingCart, DollarSign, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(0, 85%, 50%)", "hsl(0, 0%, 20%)", "hsl(0, 85%, 65%)", "hsl(0, 0%, 45%)", "hsl(0, 85%, 80%)"];

const Admin = () => {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [profilesRes, ordersRes, commissionsRes, productsRes, subsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("commissions").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      ]);
      setProfiles(profilesRes.data || []);
      setOrders(ordersRes.data || []);
      setCommissions(commissionsRes.data || []);
      setProducts(productsRes.data || []);
      setSubscriptions(subsRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  // Category breakdown from products
  const categoryMap: Record<string, number> = {};
  products.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Monthly revenue from orders
  const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
  orders.forEach(o => {
    const month = new Date(o.created_at).toLocaleString("default", { month: "short" });
    if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, orders: 0 };
    monthlyMap[month].revenue += o.total_amount || 0;
    monthlyMap[month].orders += 1;
  });
  const revenueData = Object.entries(monthlyMap).map(([month, d]) => ({ month, ...d }));

  // Monthly commissions
  const commMonthlyMap: Record<string, number> = {};
  commissions.forEach(c => {
    const month = new Date(c.created_at).toLocaleString("default", { month: "short" });
    commMonthlyMap[month] = (commMonthlyMap[month] || 0) + c.commission_amount;
  });
  const commissionData = Object.entries(commMonthlyMap).map(([month, commission]) => ({ month, commission }));

  const stats = [
    { label: t("admin.totalUsers"), value: profiles.length.toLocaleString(), icon: Users, change: "" },
    { label: t("admin.totalOrders"), value: orders.length.toLocaleString(), icon: ShoppingCart, change: "" },
    { label: t("admin.revenue"), value: `${totalRevenue.toLocaleString()} RWF`, icon: DollarSign, change: "" },
    { label: t("admin.commission"), value: `${totalCommissions.toLocaleString()} RWF`, icon: TrendingUp, change: "" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-10">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">{t("admin.title")}</h1>
            <p className="text-muted-foreground mt-1">Manage users, orders, commissions and analytics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="analytics">{t("admin.analytics")}</TabsTrigger>
              <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
              <TabsTrigger value="orders">{t("admin.orders")}</TabsTrigger>
              <TabsTrigger value="commissions">{t("admin.commissions")}</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">{t("admin.revenue")} (RWF)</CardTitle></CardHeader>
                  <CardContent>
                    {revenueData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                          <XAxis dataKey="month" /><YAxis /><Tooltip />
                          <Bar dataKey="revenue" fill="hsl(0, 85%, 50%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">No revenue data yet</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">{t("admin.orders")} Trend</CardTitle></CardHeader>
                  <CardContent>
                    {revenueData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                          <XAxis dataKey="month" /><YAxis /><Tooltip />
                          <Line type="monotone" dataKey="orders" stroke="hsl(0, 85%, 50%)" strokeWidth={2} dot={{ fill: "hsl(0, 85%, 50%)" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">No order data yet</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Products by Category</CardTitle></CardHeader>
                  <CardContent>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">No product data yet</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">{t("admin.commission")} Trend</CardTitle></CardHeader>
                  <CardContent>
                    {commissionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={commissionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                          <XAxis dataKey="month" /><YAxis /><Tooltip />
                          <Bar dataKey="commission" fill="hsl(0, 0%, 20%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">No commission data yet</p>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader><CardTitle>{t("admin.users")} Management</CardTitle></CardHeader>
                <CardContent>
                  {profiles.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users registered yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "seller" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {u.role}
                              </span>
                            </TableCell>
                            <TableCell>{u.business_name || "—"}</TableCell>
                            <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader><CardTitle>{t("admin.orders")} Tracking</CardTitle></CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium">{o.id.slice(0, 8)}...</TableCell>
                            <TableCell>{(o.total_amount || 0).toLocaleString()} RWF</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                o.status === "delivered" ? "bg-green-100 text-green-700" :
                                o.status === "shipped" ? "bg-blue-100 text-blue-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>{o.status}</span>
                            </TableCell>
                            <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commissions">
              <Card>
                <CardHeader><CardTitle>{t("admin.commissions")} Report</CardTitle></CardHeader>
                <CardContent>
                  {commissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No commission records yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Sale Amount</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.order_id.slice(0, 8)}...</TableCell>
                            <TableCell>{c.sale_amount.toLocaleString()} RWF</TableCell>
                            <TableCell>{c.commission_rate}%</TableCell>
                            <TableCell className="text-primary font-medium">{c.commission_amount.toLocaleString()} RWF</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {c.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Admin;
