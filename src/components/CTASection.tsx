import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "Access all services — Logistics, Packaging, Marketplace, E-Library",
  "Connect with verified sellers and buyers",
  "Read unlimited books online",
  "Real-time tracking and order management",
];

const CTASection = () => (
  <section className="py-20 bg-foreground text-background relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl" />
    </div>

    <div className="container relative">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Join Today</span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold">
          Start for Just <span className="text-primary">200 RWF</span>
        </h2>
        <p className="text-background/60 text-lg max-w-xl mx-auto">
          Unlock all ISOKO GROUP services with a single affordable subscription. Pay via Mobile Money, Card, or PayPal.
        </p>

        <ul className="flex flex-col items-start max-w-md mx-auto gap-3">
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-background/70">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>

        <Link to="/login">
          <Button size="lg" className="gap-2 text-base px-10 mt-4">
            Get Started Now <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default CTASection;
