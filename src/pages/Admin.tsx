import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { Users, ShoppingCart, DollarSign, BarChart3, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 120000, orders: 45 },
  { month: "Feb", revenue: 185000, orders: 62 },
  { month: "Mar", revenue: 230000, orders: 78 },
  { month: "Apr", revenue: 195000, orders: 55 },
  { month: "May", revenue: 310000, orders: 98 },
  { month: "Jun", revenue: 280000, orders: 85 },
];

const commissionData = [
  { month: "Jan", commission: 12000 },
  { month: "Feb", commission: 18500 },
  { month: "Mar", commission: 23000 },
  { month: "Apr", commission: 19500 },
  { month: "May", commission: 31000 },
  { month: "Jun", commission: 28000 },
];

const categoryData = [
  { name: "Electronics", value: 35 },
  { name: "Fashion", value: 25 },
  { name: "Food", value: 20 },
  { name: "Crafts", value: 12 },
  { name: "Home", value: 8 },
];

const COLORS = ["hsl(0, 85%, 50%)", "hsl(0, 0%, 20%)", "hsl(0, 85%, 65%)", "hsl(0, 0%, 45%)", "hsl(0, 85%, 80%)"];

const mockUsers = [
  { id: 1, name: "Jean Paul M.", email: "jean@example.com", role: "Seller", status: "Active", joined: "2026-01-15" },
  { id: 2, name: "Marie Claire N.", email: "marie@example.com", role: "Buyer", status: "Active", joined: "2026-02-20" },
  { id: 3, name: "Patrick K.", email: "patrick@example.com", role: "Seller", status: "Pending", joined: "2026-03-10" },
  { id: 4, name: "Grace U.", email: "grace@example.com", role: "Buyer", status: "Active", joined: "2026-03-25" },
  { id: 5, name: "Eric T.", email: "eric@example.com", role: "Seller", status: "Active", joined: "2026-04-01" },
];

const mockOrders = [
  { id: "ORD-001", customer: "Marie Claire N.", product: "Wireless Earbuds", amount: "12,500 RWF", status: "Delivered", date: "2026-04-01" },
  { id: "ORD-002", customer: "Grace U.", product: "Coffee Beans", amount: "8,000 RWF", status: "Shipped", date: "2026-04-02" },
  { id: "ORD-003", customer: "Patrick K.", product: "Handwoven Basket", amount: "15,000 RWF", status: "Processing", date: "2026-04-03" },
  { id: "ORD-004", customer: "Jean Paul M.", product: "Smart Watch", amount: "22,000 RWF", status: "Delivered", date: "2026-04-04" },
  { id: "ORD-005", customer: "Eric T.", product: "Leather Wallet", amount: "18,000 RWF", status: "Shipped", date: "2026-04-05" },
];

const Admin = () => {
  const { t } = useI18n();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const stats = [
    { label: t("admin.totalUsers"), value: "1,247", icon: Users, change: "+12%" },
    { label: t("admin.totalOrders"), value: "423", icon: ShoppingCart, change: "+8%" },
    { label: t("admin.revenue"), value: "1.32M RWF", icon: DollarSign, change: "+23%" },
    { label: t("admin.commission"), value: "132K RWF", icon: TrendingUp, change: "+23%" },
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

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-primary font-medium mt-1">{stat.change} this month</p>
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
                  <CardHeader>
                    <CardTitle className="text-lg">{t("admin.revenue")} (RWF)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="hsl(0, 85%, 50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("admin.orders")} Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="hsl(0, 85%, 50%)" strokeWidth={2} dot={{ fill: "hsl(0, 85%, 50%)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("admin.commission")} Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={commissionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="commission" fill="hsl(0, 0%, 20%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.users")} Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "Seller" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {u.status}
                            </span>
                          </TableCell>
                          <TableCell>{u.joined}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.orders")} Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockOrders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.id}</TableCell>
                          <TableCell>{o.customer}</TableCell>
                          <TableCell>{o.product}</TableCell>
                          <TableCell>{o.amount}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              o.status === "Delivered" ? "bg-green-100 text-green-700" :
                              o.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {o.status}
                            </span>
                          </TableCell>
                          <TableCell>{o.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commissions">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.commissions")} Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>Commission (10%)</TableHead>
                        <TableHead>Net Earnings</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { seller: "Jean Paul M.", sales: "450,000 RWF", commission: "45,000 RWF", net: "405,000 RWF", status: "Paid" },
                        { seller: "Patrick K.", sales: "280,000 RWF", commission: "28,000 RWF", net: "252,000 RWF", status: "Pending" },
                        { seller: "Eric T.", sales: "195,000 RWF", commission: "19,500 RWF", net: "175,500 RWF", status: "Paid" },
                      ].map((c) => (
                        <TableRow key={c.seller}>
                          <TableCell className="font-medium">{c.seller}</TableCell>
                          <TableCell>{c.sales}</TableCell>
                          <TableCell className="text-primary font-medium">{c.commission}</TableCell>
                          <TableCell>{c.net}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {c.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
