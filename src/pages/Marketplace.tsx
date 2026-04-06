import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const categories = ["All", "Electronics", "Fashion", "Food & Drink", "Crafts", "Home", "Accessories"];

const allProducts = [
  { name: "Wireless Earbuds Pro", price: "12,500 RWF", rating: 4.8, category: "Electronics" },
  { name: "Organic Coffee Beans", price: "8,000 RWF", rating: 4.9, category: "Food & Drink" },
  { name: "Handwoven Basket", price: "15,000 RWF", rating: 4.7, category: "Crafts" },
  { name: "Smart Watch Band", price: "22,000 RWF", rating: 4.6, category: "Accessories" },
  { name: "Leather Wallet", price: "18,000 RWF", rating: 4.5, category: "Fashion" },
  { name: "Bluetooth Speaker", price: "30,000 RWF", rating: 4.8, category: "Electronics" },
  { name: "Traditional Fabric", price: "10,000 RWF", rating: 4.4, category: "Fashion" },
  { name: "Home Candle Set", price: "6,500 RWF", rating: 4.3, category: "Home" },
];

const Marketplace = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? allProducts : allProducts.filter((p) => p.category === active);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Marketplace</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Shop the Best Products</h1>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <div key={i} className="group rounded-xl border border-border bg-card overflow-hidden hover-lift">
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-xs text-primary font-medium">{product.category}</span>
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{product.price}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {product.rating}
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-2">Add to Cart</Button>
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
