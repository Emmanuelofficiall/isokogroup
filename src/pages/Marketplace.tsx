import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import wirelessEarbuds from "@/assets/products/wireless-earbuds.jpg";
import coffeeBeans from "@/assets/products/coffee-beans.jpg";
import handwovenBasket from "@/assets/products/handwoven-basket.jpg";
import smartWatch from "@/assets/products/smart-watch.jpg";
import leatherWallet from "@/assets/products/leather-wallet.jpg";
import bluetoothSpeaker from "@/assets/products/bluetooth-speaker.jpg";
import traditionalFabric from "@/assets/products/traditional-fabric.jpg";
import candleSet from "@/assets/products/candle-set.jpg";

const categories = ["All", "Electronics", "Fashion", "Food & Drink", "Crafts", "Home", "Accessories"];

const defaultProducts = [
  { name: "Wireless Earbuds Pro", price: 12500, rating: 4.8, category: "Electronics", image: wirelessEarbuds },
  { name: "Organic Coffee Beans", price: 8000, rating: 4.9, category: "Food & Drink", image: coffeeBeans },
  { name: "Handwoven Basket", price: 15000, rating: 4.7, category: "Crafts", image: handwovenBasket },
  { name: "Smart Watch Band", price: 22000, rating: 4.6, category: "Accessories", image: smartWatch },
  { name: "Leather Wallet", price: 18000, rating: 4.5, category: "Fashion", image: leatherWallet },
  { name: "Bluetooth Speaker", price: 30000, rating: 4.8, category: "Electronics", image: bluetoothSpeaker },
  { name: "Traditional Fabric", price: 10000, rating: 4.4, category: "Fashion", image: traditionalFabric },
  { name: "Home Candle Set", price: 6500, rating: 4.3, category: "Home", image: candleSet },
];

const Marketplace = () => {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*").eq("status", "active");
      if (data) setDbProducts(data);
    };
    fetchProducts();
  }, []);

  const allProducts = [
    ...defaultProducts.map(p => ({ ...p, id: p.name, isDefault: true })),
    ...dbProducts.map(p => ({ name: p.name, price: p.price, rating: 4.5, category: p.category, image: p.image_url, id: p.id, isDefault: false })),
  ];

  const filtered = allProducts
    .filter(p => active === "All" || p.category === active)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddToCart = async (product: any) => {
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (product.isDefault) {
      toast({ title: "Added to Cart!", description: `${product.name} added to your cart.` });
      return;
    }
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: product.id,
      quantity: 1,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Added to Cart!", description: `${product.name} added to your cart.` });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.marketplace")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{t("marketplace.title")}</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("marketplace.search")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${active === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <div key={product.id || i} className="group rounded-xl border border-border bg-card overflow-hidden hover-lift">
                <div className="aspect-square overflow-hidden">
                  <img src={product.image || "/placeholder.svg"} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-xs text-primary font-medium">{product.category}</span>
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{product.price.toLocaleString()} RWF</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {product.rating}
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-2 gap-2" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="h-3 w-3" /> {t("marketplace.addToCart")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Marketplace;
