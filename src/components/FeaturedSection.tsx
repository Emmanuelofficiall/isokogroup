import { Star, ShoppingCart, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const products = [
  { name: "Wireless Earbuds Pro", price: "12,500 RWF", rating: 4.8, category: "Electronics" },
  { name: "Organic Coffee Beans", price: "8,000 RWF", rating: 4.9, category: "Food & Drink" },
  { name: "Handwoven Basket", price: "15,000 RWF", rating: 4.7, category: "Crafts" },
  { name: "Smart Watch Band", price: "22,000 RWF", rating: 4.6, category: "Accessories" },
];

const books = [
  { title: "The Art of Business", author: "Jean Paul M.", category: "Business" },
  { title: "Rwanda Rising", author: "Marie Claire N.", category: "History" },
  { title: "Digital Innovation", author: "Patrick K.", category: "Technology" },
  { title: "Leadership Essentials", author: "Grace U.", category: "Self-Help" },
];

const FeaturedSection = () => (
  <>
    {/* Featured Products */}
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Marketplace</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Featured Products</h2>
          </div>
          <Link to="/marketplace" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <div key={i} className="group rounded-xl border border-border bg-card overflow-hidden hover-lift">
              <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Featured Books */}
    <section className="py-20">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">E-Library</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Featured Books</h2>
          </div>
          <Link to="/e-library" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
            Browse library <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book, i) => (
            <div key={i} className="group rounded-xl border border-border bg-card p-5 hover-lift">
              <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                <BookOpen className="h-10 w-10 text-primary/40" />
              </div>
              <span className="text-xs text-primary font-medium">{book.category}</span>
              <h3 className="font-semibold text-sm mt-1">{book.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">by {book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default FeaturedSection;
