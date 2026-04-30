import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, Minus, Plus, Smartphone, Landmark, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { COMPANY_PAYMENT, COMMISSION_RATE } from "@/lib/company";
import { notify } from "@/lib/notify";

type CartRow = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    seller_id: string;
    stock: number;
  };
};

const Cart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState("");
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank" | "auto">("momo");
  const [paymentReference, setPaymentReference] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("cart_items")
      .select("id, product_id, quantity, product:products(id,name,price,image_url,seller_id,stock)")
      .eq("user_id", user.id);
    if (error) toast({ title: "Error loading cart", description: error.message, variant: "destructive" });
    setItems((data || []).filter((r: any) => r.product));
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateQty = async (row: CartRow, qty: number) => {
    if (qty < 1) return;
    const { error } = await (supabase as any).from("cart_items").update({ quantity: qty }).eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  const removeItem = async (id: string) => {
    const { error } = await (supabase as any).from("cart_items").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  const total = items.reduce((s, r) => s + r.product.price * r.quantity, 0);

  const checkout = async () => {
    if (!user) return;
    if (items.length === 0) return;
    if (!shipping.trim()) {
      toast({ title: "Shipping address required", variant: "destructive" });
      return;
    }
    setPlacing(true);
    try {
      // Group by seller
      const groups: Record<string, CartRow[]> = {};
      items.forEach((r) => {
        const k = r.product.seller_id;
        if (!groups[k]) groups[k] = [];
        groups[k].push(r);
      });

      for (const sellerId of Object.keys(groups)) {
        const rows = groups[sellerId];
        const orderTotal = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);

        const { data: order, error: oErr } = await (supabase as any)
          .from("orders")
          .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            total_amount: orderTotal,
            shipping_address: shipping,
            status: "pending",
          })
          .select()
          .single();
        if (oErr) throw oErr;

        const orderItems = rows.map((r) => ({
          order_id: order.id,
          product_id: r.product_id,
          quantity: r.quantity,
          unit_price: r.product.price,
        }));
        const { error: iErr } = await (supabase as any).from("order_items").insert(orderItems);
        if (iErr) throw iErr;

        // 10% commission record
        await (supabase as any).from("commissions").insert({
          seller_id: sellerId,
          order_id: order.id,
          sale_amount: orderTotal,
          commission_amount: Math.round(orderTotal * 0.1),
          commission_rate: 10,
          status: "pending",
        });
      }

      // clear cart
      await (supabase as any).from("cart_items").delete().eq("user_id", user.id);
      toast({ title: "Order placed!", description: "Your order has been submitted to the seller." });
      navigate("/marketplace");
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground mb-8">Review items and place your order.</p>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate("/marketplace")}>Browse Marketplace</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((row) => (
                <div key={row.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {row.product.image_url ? (
                      <img src={row.product.image_url} alt={row.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{row.product.name}</h3>
                    <p className="text-primary font-bold">{row.product.price.toLocaleString()} RWF</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(row, row.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{row.quantity}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(row, row.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button size="icon" variant="ghost" onClick={() => removeItem(row.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <span className="font-semibold">{(row.product.price * row.quantity).toLocaleString()} RWF</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 h-fit space-y-4">
              <h2 className="font-display text-xl font-bold">Order Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{items.reduce((s, r) => s + r.quantity, 0)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border pt-3">
                <span>Total</span>
                <span className="text-primary">{total.toLocaleString()} RWF</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shipping address</label>
                <Input placeholder="Street, City, Rwanda" value={shipping} onChange={(e) => setShipping(e.target.value)} />
              </div>
              <Button className="w-full" disabled={placing} onClick={checkout}>
                {placing ? "Placing order…" : "Place Order"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
