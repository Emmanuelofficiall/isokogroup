import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, Upload, User, Bell, Wallet } from "lucide-react";
import { Navigate } from "react-router-dom";
import { COMMISSION_RATE, COMPANY_PAYMENT } from "@/lib/company";
import { notify } from "@/lib/notify";

const categories = ["Electronics", "Fashion", "Food & Drink", "Crafts", "Home", "Accessories"];

const SellerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"momo" | "bank">("momo");
  const [payoutDestination, setPayoutDestination] = useState("");

  // Product form
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState(categories[0]);
  const [productStock, setProductStock] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);

  // Profile form
  const [editFullName, setEditFullName] = useState("");
  const [editBusiness, setEditBusiness] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [productsRes, ordersRes, commissionsRes, profileRes, payoutsRes] = await Promise.all([
      supabase.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      (supabase as any).from("payout_requests").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProducts(productsRes.data || []);
    setOrders(ordersRes.data || []);
    setCommissions(commissionsRes.data || []);
    setPayouts(payoutsRes.data || []);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditFullName(profileRes.data.full_name || "");
      setEditBusiness(profileRes.data.business_name || "");
      setEditPhone(profileRes.data.phone || "");
    }
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);
    let imageUrl = null;
    if (productImage) {
      const ext = productImage.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, productImage);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }
    const { error } = await supabase.from("products").insert({
      seller_id: user.id, name: productName, description: productDesc,
      price: parseInt(productPrice), category: productCategory,
      stock: parseInt(productStock) || 0, image_url: imageUrl,
    });
    setUploading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product added!" });
      setShowAddProduct(false);
      setProductName(""); setProductDesc(""); setProductPrice(""); setProductStock(""); setProductImage(null);
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) { toast({ title: "Deleted" }); fetchData(); }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) { toast({ title: "Updated" }); fetchData(); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({
      full_name: editFullName, business_name: editBusiness, phone: editPhone,
    }).eq("id", profile.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated!" });
      fetchData();
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const totalSales = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0);
  const totalCommission = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const netEarnings = totalSales - totalCommission;

  const monthlyData = orders.reduce((acc: any[], order) => {
    const month = new Date(order.created_at).toLocaleString("default", { month: "short" });
    const existing = acc.find(a => a.month === month);
    if (existing) { existing.sales += order.total_amount; existing.orders += 1; }
    else { acc.push({ month, sales: order.total_amount, orders: 1 }); }
    return acc;
  }, []);

  const productPopularity = products.map(p => ({ name: p.name.slice(0, 15), stock: p.stock }));

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-10">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your products, orders, earnings, and profile</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Products", value: products.length, icon: Package },
              { label: "Orders", value: orders.length, icon: ShoppingCart },
              { label: "Total Sales", value: `${totalSales.toLocaleString()} RWF`, icon: DollarSign },
              { label: "Net Earnings", value: `${netEarnings.toLocaleString()} RWF`, icon: TrendingUp },
            ].map((stat) => (
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

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>My Products</CardTitle>
                  <Button size="sm" onClick={() => setShowAddProduct(!showAddProduct)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Product
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddProduct && (
                    <form onSubmit={handleAddProduct} className="mb-6 p-4 border border-border rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Product Name</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Category</Label>
                          <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2"><Label>Description</Label><Input value={productDesc} onChange={(e) => setProductDesc(e.target.value)} /></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Price (RWF)</Label><Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Stock</Label><Input type="number" value={productStock} onChange={(e) => setProductStock(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Product Image</Label><Input type="file" accept="image/*" onChange={(e) => setProductImage(e.target.files?.[0] || null)} /></div>
                      </div>
                      <Button type="submit" disabled={uploading} className="gap-2"><Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Add Product"}</Button>
                    </form>
                  )}
                  {products.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No products yet. Add your first product!</p>
                  ) : (
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Image</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
                        <TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {products.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.image_url ? <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>}</TableCell>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>{p.category}</TableCell>
                            <TableCell>{p.price.toLocaleString()} RWF</TableCell>
                            <TableCell>{p.stock}</TableCell>
                            <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span></TableCell>
                            <TableCell><Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(p.id)}>Delete</Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader><CardTitle>Order Management</CardTitle></CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders yet.</p>
                  ) : (
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Order ID</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {orders.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium">{o.id.slice(0, 8)}...</TableCell>
                            <TableCell>{o.total_amount.toLocaleString()} RWF</TableCell>
                            <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span></TableCell>
                            <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)} className="text-xs border rounded px-2 py-1 bg-background">
                                <option value="pending">Pending</option><option value="processing">Processing</option>
                                <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
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

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Sales Trend</CardTitle></CardHeader>
                  <CardContent>
                    {monthlyData.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No sales data yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                          <XAxis dataKey="month" /><YAxis /><Tooltip />
                          <Bar dataKey="sales" fill="hsl(0, 85%, 50%)" radius={[4, 4, 0, 0]} name="Sales (RWF)" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Product Stock Levels</CardTitle></CardHeader>
                  <CardContent>
                    {productPopularity.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No products yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productPopularity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                          <XAxis dataKey="name" /><YAxis /><Tooltip />
                          <Bar dataKey="stock" fill="hsl(0, 0%, 20%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="hover-lift"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Gross Sales</p><p className="text-2xl font-bold text-primary mt-1">{totalSales.toLocaleString()} RWF</p></CardContent></Card>
                <Card className="hover-lift"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Platform Commission (10%)</p><p className="text-2xl font-bold text-destructive mt-1">-{totalCommission.toLocaleString()} RWF</p></CardContent></Card>
                <Card className="hover-lift"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Net Earnings</p><p className="text-2xl font-bold mt-1">{netEarnings.toLocaleString()} RWF</p></CardContent></Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Commission Breakdown (10% per Order)</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">A 10% commission is deducted from each completed sale. Below is the per-order breakdown of your earnings.</p>
                </CardHeader>
                <CardContent>
                  {commissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No commission records yet. Earnings appear here once orders are placed.</p>
                  ) : (
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Sale Amount</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>You Receive</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {commissions.map((c) => {
                          const youReceive = c.sale_amount - c.commission_amount;
                          return (
                            <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                              <TableCell className="font-mono text-xs">{c.order_id.slice(0, 8)}…</TableCell>
                              <TableCell>{c.sale_amount.toLocaleString()} RWF</TableCell>
                              <TableCell><span className="px-2 py-0.5 rounded-full bg-muted text-xs">{c.commission_rate}%</span></TableCell>
                              <TableCell className="text-destructive font-medium">-{c.commission_amount.toLocaleString()} RWF</TableCell>
                              <TableCell className="text-primary font-semibold">{youReceive.toLocaleString()} RWF</TableCell>
                              <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span></TableCell>
                              <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <tfoot className="border-t-2 border-border">
                        <tr className="font-semibold">
                          <td className="p-3 text-sm">TOTALS</td>
                          <td className="p-3 text-sm">{totalSales.toLocaleString()} RWF</td>
                          <td className="p-3"></td>
                          <td className="p-3 text-sm text-destructive">-{totalCommission.toLocaleString()} RWF</td>
                          <td className="p-3 text-sm text-primary">{netEarnings.toLocaleString()} RWF</td>
                          <td className="p-3"></td>
                          <td className="p-3"></td>
                        </tr>
                      </tfoot>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account Settings</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Business Name</Label><Input value={editBusiness} onChange={(e) => setEditBusiness(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
                    <Button type="submit">Save Changes</Button>
                  </form>
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

export default SellerDashboard;
