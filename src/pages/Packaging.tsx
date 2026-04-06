import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Shield, Clock, Banknote } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const packagingTypes = [
  { icon: Package, title: "Standard", desc: "Basic protective packaging for everyday items.", price: "500 RWF", value: "standard" },
  { icon: Shield, title: "Premium", desc: "Extra cushioning and waterproof wrapping for fragile goods.", price: "1,500 RWF", value: "premium" },
  { icon: Clock, title: "Express", desc: "Priority packaging with same-day processing.", price: "2,500 RWF", value: "express" },
  { icon: Banknote, title: "Bulk", desc: "Discounted rates for large quantity orders.", price: "Custom", value: "bulk" },
];

const Packaging = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState("");
  const [qty, setQty] = useState("1");
  const [pickupDate, setPickupDate] = useState("");
  const [selectedType, setSelectedType] = useState("standard");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      navigate("/login");
      return;
    }
    setLoading(true);
    const { error } = await (supabase as any).from("packaging_requests").insert({
      user_id: user.id,
      item_description: items,
      quantity: parseInt(qty) || 1,
      packaging_type: selectedType,
      pickup_date: pickupDate || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your packaging request has been submitted." });
      setItems(""); setQty("1"); setPickupDate("");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.packaging")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{t("packaging.title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("packaging.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {packagingTypes.map((p) => (
              <div key={p.title}
                onClick={() => setSelectedType(p.value)}
                className={`group rounded-xl border bg-card p-6 hover-lift text-center cursor-pointer transition-colors ${selectedType === p.value ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
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
            <h2 className="text-2xl font-display font-bold mb-6 text-center">{t("packaging.requestTitle")}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="items">{t("packaging.itemDesc")}</Label>
                <Input id="items" placeholder="Describe your items" value={items} onChange={(e) => setItems(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty">{t("packaging.quantity")}</Label>
                  <Input id="qty" type="number" placeholder="1" value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">{t("packaging.pickupDate")}</Label>
                  <Input id="pickup-date" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </div>
              </div>
              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : t("packaging.submit")}
              </Button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Packaging;
