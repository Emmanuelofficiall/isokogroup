import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Users, ShoppingCart, DollarSign, TrendingUp, Package, BookOpen, Truck, Box, Bell, Settings, FileText, Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(0, 85%, 50%)", "hsl(0, 0%, 20%)", "hsl(0, 85%, 65%)", "hsl(0, 0%, 45%)", "hsl(0, 85%, 80%)"];

const Admin = () => {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [logisticsRequests, setLogisticsRequests] = useState<any[]>([]);
  const [packagingRequests, setPackagingRequests] = useState<any[]>([]);
  const [sellerApplications, setSellerApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Book form
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCategory, setBookCategory] = useState("Business");
  const [bookPages, setBookPages] = useState("");
  const [bookDesc, setBookDesc] = useState("");

  // Reject dialog state
  const [rejectingApp, setRejectingApp] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const MAX_REASON = 500;

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const [profilesRes, ordersRes, commissionsRes, productsRes, subsRes, booksRes, logRes, packRes, sellerRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("books").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("logistics_requests").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("packaging_requests").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("seller_applications").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles(profilesRes.data || []);
    setOrders(ordersRes.data || []);
    setCommissions(commissionsRes.data || []);
    setProducts(productsRes.data || []);
    setSubscriptions(subsRes.data || []);
    setBooks(booksRes.data || []);
    setLogisticsRequests(logRes.data || []);
    setPackagingRequests(packRes.data || []);
    setSellerApplications(sellerRes.data || []);
    setLoading(false);
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  const categoryMap: Record<string, number> = {};
  products.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
  orders.forEach(o => {
    const month = new Date(o.created_at).toLocaleString("default", { month: "short" });
    if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, orders: 0 };
    monthlyMap[month].revenue += o.total_amount || 0;
    monthlyMap[month].orders += 1;
  });
  const revenueData = Object.entries(monthlyMap).map(([month, d]) => ({ month, ...d }));

  const commMonthlyMap: Record<string, number> = {};
  commissions.forEach(c => {
    const month = new Date(c.created_at).toLocaleString("default", { month: "short" });
    commMonthlyMap[month] = (commMonthlyMap[month] || 0) + c.commission_amount;
  });
  const commissionData = Object.entries(commMonthlyMap).map(([month, commission]) => ({ month, commission }));

  const stats = [
    { label: t("admin.totalUsers"), value: profiles.length.toLocaleString(), icon: Users },
    { label: t("admin.totalOrders"), value: orders.length.toLocaleString(), icon: ShoppingCart },
    { label: t("admin.revenue"), value: `${totalRevenue.toLocaleString()} RWF`, icon: DollarSign },
    { label: t("admin.commission"), value: `${totalCommissions.toLocaleString()} RWF`, icon: TrendingUp },
  ];

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (!error) { toast({ title: "Updated" }); fetchAll(); }
  };

  const handleUpdateProductStatus = async (productId: string, status: string) => {
    const { error } = await supabase.from("products").update({ status }).eq("id", productId);
    if (!error) { toast({ title: "Updated" }); fetchAll(); }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) { toast({ title: "Deleted" }); fetchAll(); }
  };

  const handleDeleteBook = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (!error) { toast({ title: "Deleted" }); fetchAll(); }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("books").insert({
      title: bookTitle, author: bookAuthor, category: bookCategory,
      pages: parseInt(bookPages) || 0, description: bookDesc,
    });
    if (!error) {
      toast({ title: "Book added!" });
      setBookTitle(""); setBookAuthor(""); setBookPages(""); setBookDesc("");
      fetchAll();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateLogisticsStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("logistics_requests").update({ status }).eq("id", id);
    if (!error) { toast({ title: "Updated" }); fetchAll(); }
  };

  const handleUpdatePackagingStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("packaging_requests").update({ status }).eq("id", id);
    if (!error) { toast({ title: "Updated" }); fetchAll(); }
  };

  const handleApproveApplication = async (app: any) => {
    // Update application status
    await (supabase as any).from("seller_applications").update({ status: "approved" }).eq("id", app.id);
    // Update user profile role to seller
    await supabase.from("profiles").update({ role: "seller", business_name: app.business_name }).eq("user_id", app.user_id);
    toast({ title: "Seller Approved!" });
    fetchAll();
  };

  const handleRejectApplication = (app: any) => {
    setRejectingApp(app);
    setRejectReason("");
  };

  const confirmRejectApplication = async () => {
    if (!rejectingApp) return;
    const trimmed = rejectReason.trim().slice(0, MAX_REASON);
    setRejectSubmitting(true);
    const { error } = await (supabase as any)
      .from("seller_applications")
      .update({ status: "rejected", rejection_reason: trimmed || null })
      .eq("id", rejectingApp.id);
    setRejectSubmitting(false);
    if (error) {
      toast({ title: "Reject failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Application Rejected", description: trimmed ? "Reason shared with applicant." : "No reason provided." });
    setRejectingApp(null);
    setRejectReason("");
    fetchAll();
  };

  const getSignedIdUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("id-documents")
      .createSignedUrl(path, 60 * 5); // 5 min
    if (error || !data?.signedUrl) {
      toast({ title: "Could not load document", description: error?.message || "Unknown error", variant: "destructive" });
      return null;
    }
    return data.signedUrl;
  };

  const handleViewId = async (path: string | null) => {
    if (!path) { toast({ title: "No document uploaded", variant: "destructive" }); return; }
    const url = await getSignedIdUrl(path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadId = async (path: string | null, applicantName: string) => {
    if (!path) { toast({ title: "No document uploaded", variant: "destructive" }); return; }
    const url = await getSignedIdUrl(path);
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = path.split(".").pop() || "bin";
      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `id-${applicantName.replace(/[^a-z0-9]+/gi, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      toast({ title: "Download failed", description: e?.message || "Unknown error", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-10">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">{t("admin.title")}</h1>
            <p className="text-muted-foreground mt-1">Manage users, sellers, orders, products, library, logistics & more</p>
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
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="analytics">{t("admin.analytics")}</TabsTrigger>
              <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
              <TabsTrigger value="sellers">Sellers</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">{t("admin.orders")}</TabsTrigger>
              <TabsTrigger value="commissions">{t("admin.commissions")}</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="packaging">Packaging</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
            </TabsList>

            {/* Analytics */}
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
                          <Line type="monotone" dataKey="orders" stroke="hsl(0, 85%, 50%)" strokeWidth={2} />
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
                            {categoryData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
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

            {/* Users */}
            <TabsContent value="users">
              <Card>
                <CardHeader><CardTitle>{t("admin.users")} Management ({profiles.length})</CardTitle></CardHeader>
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
                          <TableHead>Phone</TableHead>
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
                            <TableCell>{u.phone || "—"}</TableCell>
                            <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sellers / Applications */}
            <TabsContent value="sellers">
              <Card>
                <CardHeader><CardTitle>Seller Applications ({sellerApplications.length})</CardTitle></CardHeader>
                <CardContent>
                  {sellerApplications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No seller applications yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>ID Document</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sellerApplications.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.full_name}</TableCell>
                            <TableCell>{a.business_name}</TableCell>
                            <TableCell>{a.email || "—"}</TableCell>
                            <TableCell>{a.phone}</TableCell>
                            <TableCell className="font-mono text-xs">{a.id_number}</TableCell>
                            <TableCell>
                              {a.id_document_url ? (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 h-8 px-2"
                                    onClick={() => handleViewId(a.id_document_url)}
                                    title="View document"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">View</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 h-8 px-2"
                                    onClick={() => handleDownloadId(a.id_document_url, a.full_name)}
                                    title="Download document"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Download</span>
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No document</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                a.status === "approved" ? "bg-green-100 text-green-700" :
                                a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>{a.status}</span>
                            </TableCell>
                            <TableCell>
                              {a.status === "pending" ? (
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleApproveApplication(a)}>Approve</Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRejectApplication(a)}>Reject</Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products */}
            <TabsContent value="products">
              <Card>
                <CardHeader><CardTitle>Product Management ({products.length})</CardTitle></CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No products yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              {p.image_url ? <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded object-cover" /> :
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>}
                            </TableCell>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>{p.category}</TableCell>
                            <TableCell>{p.price?.toLocaleString()} RWF</TableCell>
                            <TableCell>{p.stock}</TableCell>
                            <TableCell>
                              <select value={p.status} onChange={(e) => handleUpdateProductStatus(p.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1 bg-background">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(p.id)}>Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <Card>
                <CardHeader><CardTitle>{t("admin.orders")} Tracking ({orders.length})</CardTitle></CardHeader>
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
                          <TableHead>Actions</TableHead>
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
                            <TableCell>
                              <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1 bg-background">
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commissions */}
            <TabsContent value="commissions">
              <Card>
                <CardHeader><CardTitle>{t("admin.commissions")} Report ({commissions.length})</CardTitle></CardHeader>
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

            {/* Logistics */}
            <TabsContent value="logistics">
              <Card>
                <CardHeader><CardTitle>Logistics Requests ({logisticsRequests.length})</CardTitle></CardHeader>
                <CardContent>
                  {logisticsRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No logistics requests yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pickup</TableHead>
                          <TableHead>Drop-off</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logisticsRequests.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.pickup_location}</TableCell>
                            <TableCell>{r.dropoff_location}</TableCell>
                            <TableCell>{r.weight_kg || "—"} kg</TableCell>
                            <TableCell>{r.preferred_date || "—"}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                r.status === "completed" ? "bg-green-100 text-green-700" :
                                r.status === "in_transit" ? "bg-blue-100 text-blue-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>{r.status}</span>
                            </TableCell>
                            <TableCell>
                              <select value={r.status} onChange={(e) => handleUpdateLogisticsStatus(r.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1 bg-background">
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="in_transit">In Transit</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Packaging */}
            <TabsContent value="packaging">
              <Card>
                <CardHeader><CardTitle>Packaging Requests ({packagingRequests.length})</CardTitle></CardHeader>
                <CardContent>
                  {packagingRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No packaging requests yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Pickup Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packagingRequests.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.item_description}</TableCell>
                            <TableCell>{r.quantity}</TableCell>
                            <TableCell>{r.packaging_type}</TableCell>
                            <TableCell>{r.pickup_date || "—"}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                r.status === "completed" ? "bg-green-100 text-green-700" :
                                r.status === "processing" ? "bg-blue-100 text-blue-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>{r.status}</span>
                            </TableCell>
                            <TableCell>
                              <select value={r.status} onChange={(e) => handleUpdatePackagingStatus(r.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1 bg-background">
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Library */}
            <TabsContent value="library">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Library Management ({books.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBook} className="mb-6 p-4 border border-border rounded-lg space-y-4">
                    <h3 className="font-semibold">Add New Book</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Author</Label>
                        <Input value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select value={bookCategory} onChange={(e) => setBookCategory(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {["Business", "Technology", "History", "Self-Help", "Science", "Literature"].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pages</Label>
                        <Input type="number" value={bookPages} onChange={(e) => setBookPages(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={bookDesc} onChange={(e) => setBookDesc(e.target.value)} />
                      </div>
                    </div>
                    <Button type="submit">Add Book</Button>
                  </form>

                  {books.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No books in library yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Pages</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-medium">{b.title}</TableCell>
                            <TableCell>{b.author}</TableCell>
                            <TableCell>{b.category}</TableCell>
                            <TableCell>{b.pages}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteBook(b.id)}>Delete</Button>
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

      {/* Reject application dialog with optional reason */}
      <Dialog open={!!rejectingApp} onOpenChange={(open) => { if (!open) { setRejectingApp(null); setRejectReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Seller Application</DialogTitle>
            <DialogDescription>
              {rejectingApp ? (
                <>You are about to reject <span className="font-medium text-foreground">{rejectingApp.full_name}</span>'s application{rejectingApp.business_name ? ` for ${rejectingApp.business_name}` : ""}.</>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. ID document is unclear, name does not match, missing details…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value.slice(0, MAX_REASON))}
              rows={4}
              maxLength={MAX_REASON}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>This reason will be shown to the applicant.</span>
              <span>{rejectReason.length}/{MAX_REASON}</span>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setRejectingApp(null); setRejectReason(""); }} disabled={rejectSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRejectApplication} disabled={rejectSubmitting}>
              {rejectSubmitting ? "Rejecting…" : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
