import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, MapPin, Clock, Calculator } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const features = [
  { icon: Truck, title: "logistics.requestDelivery", desc: "Submit delivery requests with pickup and drop-off details." },
  { icon: MapPin, title: "logistics.realTimeTracking", desc: "Track your shipments live on an interactive map." },
  { icon: Calculator, title: "logistics.pricingCalculator", desc: "Get instant price estimates based on distance and weight." },
  { icon: Clock, title: "logistics.orderHistory", desc: "View all your past and ongoing deliveries in one place." },
];

const Logistics = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      navigate("/login");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("logistics_requests").insert({
      user_id: user.id,
      pickup_location: pickup,
      dropoff_location: dropoff,
      weight_kg: weight ? parseFloat(weight) : null,
      preferred_date: date || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your delivery request has been submitted." });
      setPickup(""); setDropoff(""); setWeight(""); setDate("");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.logistics")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{t("logistics.title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("logistics.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 hover-lift text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{t(f.title)}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">{t("logistics.requestTitle")}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="pickup">{t("logistics.pickup")}</Label>
                <Input id="pickup" placeholder="Enter pickup address" value={pickup} onChange={(e) => setPickup(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">{t("logistics.dropoff")}</Label>
                <Input id="dropoff" placeholder="Enter drop-off address" value={dropoff} onChange={(e) => setDropoff(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">{t("logistics.weight")}</Label>
                  <Input id="weight" type="number" placeholder="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t("logistics.date")}</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : t("logistics.submitRequest")}
              </Button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Logistics;
