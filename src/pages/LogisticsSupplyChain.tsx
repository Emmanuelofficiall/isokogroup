import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LogisticsSupplyChain = () => (
  <div className="min-h-screen">
    <Header />
    <section className="py-20">
      <div className="container max-w-3xl text-center space-y-6">
        <Network className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-4xl md:text-5xl font-display font-bold">
          Supply Chain Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Bonded and non-bonded shipments, customs clearance, and tax handling
          (CO2, WO1, WO2, CIF). Multi-stage tracking with full cost breakdown is
          coming in the next release.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button asChild>
            <Link to="/logistics/delivery">Start a shipment</Link>
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

export default LogisticsSupplyChain;
