import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import paperBags from "@/assets/paper-bags.jpeg";

const Packaging = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState("");
  const [qty, setQty] = useState("1");
  const [packagingType, setPackagingType] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

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
      packaging_type: packagingType,
      pickup_date: pickupDate || null,
      full_name: fullName,
      phone,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your packaging request has been submitted." });
      setItems(""); setQty("1"); setPackagingType(""); setPickupDate(""); setFullName(""); setPhone("");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative py-20 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <img src={paperBags} alt="" className="w-full h-full object-cover opacity-20 dark:opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative z-10">
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.packaging")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Request Packaging</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tell us what you need to pack — type, size and quantity — and we'll get back with a quote.
            </p>
          </div>

          <div className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-full-name">Full Name</Label>
                  <Input id="pkg-full-name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-phone">Phone</Label>
                  <Input id="pkg-phone" type="tel" placeholder="07XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="items">What needs packaging?</Label>
                <Input id="items" placeholder="e.g., 200 jars of honey" value={items} onChange={(e) => setItems(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-type">Packaging type</Label>
                <Input id="pkg-type" placeholder="Kraft / polythene / branded box…" value={packagingType} onChange={(e) => setPackagingType(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input id="qty" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup / delivery date</Label>
                  <Input id="pickup-date" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </div>
              </div>
              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
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
