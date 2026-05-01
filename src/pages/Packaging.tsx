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

const packagingTypes = [
  { title: "Brown — Small", desc: "Brown paper bag, small size.", price: "700 RWF", value: "brown-small", color: "bg-amber-700" },
  { title: "Brown — Medium", desc: "Brown paper bag, medium size.", price: "800 RWF", value: "brown-medium", color: "bg-amber-700" },
  { title: "Brown — Large", desc: "Brown paper bag, large size.", price: "1,000 RWF", value: "brown-large", color: "bg-amber-700" },
  { title: "White — Small", desc: "White paper bag, small size.", price: "900 RWF", value: "white-small", color: "bg-gray-100 border border-border" },
  { title: "White — Medium", desc: "White paper bag, medium size.", price: "1,100 RWF", value: "white-medium", color: "bg-gray-100 border border-border" },
  { title: "White — Large", desc: "White paper bag, large size.", price: "1,600 RWF", value: "white-large", color: "bg-gray-100 border border-border" },
  { title: "Black — Small", desc: "Black paper bag, small size.", price: "1,100 RWF", value: "black-small", color: "bg-neutral-900" },
  { title: "Black — Medium", desc: "Black paper bag, medium size.", price: "1,300 RWF", value: "black-medium", color: "bg-neutral-900" },
  { title: "Black — Large", desc: "Black paper bag, large size.", price: "1,800 RWF", value: "black-large", color: "bg-neutral-900" },
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
  const [selectedType, setSelectedType] = useState("brown-small");
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {packagingTypes.map((p) => (
              <div key={p.value}
                onClick={() => setSelectedType(p.value)}
                className={`group rounded-xl border bg-card p-6 hover-lift text-center cursor-pointer transition-colors ${selectedType === p.value ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${p.color}`}>
                  <Package className="h-6 w-6 text-white mix-blend-difference" />
                </div>
                <h3 className="font-semibold mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
                <span className="font-bold text-primary">{p.price}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground -mt-12 mb-20">Additional items are available on request. Please inquire for prices.</p>

          <div className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">{t("packaging.requestTitle")}</h2>
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
