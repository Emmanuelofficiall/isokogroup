import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Shield, Clock, Banknote } from "lucide-react";

const packagingTypes = [
  { icon: Package, title: "Standard", desc: "Basic protective packaging for everyday items.", price: "500 RWF" },
  { icon: Shield, title: "Premium", desc: "Extra cushioning and waterproof wrapping for fragile goods.", price: "1,500 RWF" },
  { icon: Clock, title: "Express", desc: "Priority packaging with same-day processing.", price: "2,500 RWF" },
  { icon: Banknote, title: "Bulk", desc: "Discounted rates for large quantity orders.", price: "Custom" },
];

const Packaging = () => (
  <div className="min-h-screen">
    <Header />
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Packaging</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Professional Packaging Solutions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Secure and reliable packaging for all your needs.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {packagingTypes.map((p) => (
            <div key={p.title} className="group rounded-xl border border-border bg-card p-6 hover-lift text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
              <span className="font-bold text-primary">{p.price}</span>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8">
          <h2 className="text-2xl font-display font-bold mb-6 text-center">Request Packaging</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="items">Item Description</Label>
              <Input id="items" placeholder="Describe your items" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup-date">Pickup Date</Label>
                <Input id="pickup-date" type="date" />
              </div>
            </div>
            <Button className="w-full" size="lg">Submit Request</Button>
          </form>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Packaging;
