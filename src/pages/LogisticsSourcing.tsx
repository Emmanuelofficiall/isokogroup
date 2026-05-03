import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LogisticsSourcing = () => (
  <div className="min-h-screen">
    <Header />
    <section className="py-20">
      <div className="container max-w-3xl text-center space-y-6">
        <ShoppingCart className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-4xl md:text-5xl font-display font-bold">
          Sourcing & Procurement
        </h1>
        <p className="text-muted-foreground text-lg">
          Tell us what you need — we source goods locally and internationally,
          negotiate the best price, and deliver to your door. Full procurement
          requests will be available here in the next release.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button asChild>
            <Link to="/logistics/delivery">Start a delivery request</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/logistics">Back to Logistics</Link>
          </Button>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default LogisticsSourcing;
