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
import paperBags from "@/assets/paper-bags.jpeg";
import bagBrown from "@/assets/bag-brown.jpeg";
import bagWhite from "@/assets/bag-white.jpeg";
import bagBlack from "@/assets/bag-black.jpeg";

const packagingTypes = [
  {
    title: "Printed — Size 1–5",
    desc: "Printed packaging, sizes 1 to 5. 1 bundle = 30 kg. Min order: 5 bundles.",
    price: "72,000 RWF / bundle",
    value: "printed-1-5",
    image: bagBrown,
  },
  {
    title: "Printed — Size 8–16",
    desc: "Printed packaging, sizes 8 to 16. 1 bundle = 30 kg. Min order: 5 bundles.",
    price: "67,000 RWF / bundle",
    value: "printed-8-16",
    image: bagWhite,
  },
  {
    title: "Unprinted — Size 1–5",
    desc: "Unprinted packaging, sizes 1 to 5. 1 bundle = 30 kg. Min order: 1 bundle.",
    price: "60,000 RWF / bundle",
    value: "unprinted-1-5",
    image: bagBrown,
  },
  {
    title: "Unprinted — Size 8–16",
    desc: "Unprinted packaging, sizes 8 to 16. 1 bundle = 30 kg. Min order: 1 bundle.",
    price: "54,000 RWF / bundle",
    value: "unprinted-8-16",
    image: bagBlack,
  },
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
  const [selectedType, setSelectedType] = useState("printed-1-5");
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
      packaging_type: selectedType,
      pickup_date: pickupDate || null,
      full_name: fullName,
      phone,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your packaging request has been submitted." });
      setItems(""); setQty("1"); setPickupDate(""); setFullName(""); setPhone("");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative py-20 overflow-hidden">
        {/* Paper bags hero background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <img src={paperBags} alt="" className="w-full h-full object-cover opacity-20 dark:opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.packaging")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{t("packaging.title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("packaging.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 max-w-5xl mx-auto">
            {packagingTypes.map((p) => (
              <div key={p.value}
                onClick={() => setSelectedType(p.value)}
                className={`group rounded-xl border bg-card p-4 hover-lift text-center cursor-pointer transition-colors ${selectedType === p.value ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                <div className="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-md bg-muted">
                  <img src={p.image} alt={`${p.title} packaging`} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 min-h-[3rem]">{p.desc}</p>
                <span className="font-bold text-sm text-primary">{p.price}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mb-12 max-w-2xl mx-auto">
            1 Bundle = 30 kg. Minimum order: <strong>5 bundles</strong> for printed, <strong>1 bundle</strong> for unprinted. Bulk discounts available — contact us for large volumes.
          </p>

          <div className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">{t("packaging.requestTitle")}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {(() => {
                const selected = packagingTypes.find((p) => p.value === selectedType);
                return (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Selected category</p>
                      <p className="font-semibold">{selected?.title}</p>
                    </div>
                    <span className="font-bold text-primary">{selected?.price}</span>
                  </div>
                );
              })()}
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
