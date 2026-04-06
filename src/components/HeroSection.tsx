import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Package, ShoppingBag, BookOpen } from "lucide-react";

const HeroSection = () => (
  <section className="relative overflow-hidden bg-foreground text-background">
    {/* Decorative elements */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
      <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-primary blur-3xl" />
    </div>

    <div className="container relative py-24 md:py-32 lg:py-40">
      <div className="max-w-3xl space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-background/20 px-4 py-1.5 text-sm text-background/70 animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Welcome to ISOKO GROUP
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight animate-slide-up">
          Your All-in-One Platform for{" "}
          <span className="text-primary">Logistics</span>,{" "}
          <span className="text-primary">Marketplace</span> &{" "}
          <span className="text-primary">Knowledge</span>
        </h1>

        <p className="text-lg md:text-xl text-background/60 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.15s" }}>
          We are committed to delivering reliable services, connecting buyers and sellers,
          and giving you access to knowledge through our secure e-library.
        </p>

        <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link to="/login">
            <Button size="lg" className="gap-2 text-base px-8">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button size="lg" variant="outline" className="text-base px-8 border-background/20 text-background hover:bg-background/10">
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-background/10 animate-slide-up" style={{ animationDelay: "0.45s" }}>
          {[
            { icon: Truck, label: "Logistics", desc: "Fast delivery" },
            { icon: Package, label: "Packaging", desc: "Secure packing" },
            { icon: ShoppingBag, label: "Marketplace", desc: "Buy & sell" },
            { icon: BookOpen, label: "E-Library", desc: "Read online" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-background/50">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
