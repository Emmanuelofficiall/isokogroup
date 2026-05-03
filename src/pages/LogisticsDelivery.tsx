import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, MapPin, Clock, Calculator, ArrowLeft, History } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import truck1 from "@/assets/truck-1.png";
import truck2 from "@/assets/truck-2.png";
import truck3 from "@/assets/truck-3.png";

const features = [
  { icon: Truck, title: "logistics.requestDelivery", desc: "Submit delivery requests with pickup and drop-off details." },
  { icon: MapPin, title: "logistics.realTimeTracking", desc: "Track your shipments live on an interactive map." },
  { icon: Calculator, title: "logistics.pricingCalculator", desc: "Get instant price estimates based on distance and weight." },
  { icon: Clock, title: "logistics.orderHistory", desc: "View all your past and ongoing deliveries in one place." },
];

type Product = { code: string; name: string; price: number; unit: string };
type Category = { id: string; title: string; note?: string; products: Product[] };

const categories: Category[] = [
  {
    id: "reuse-pp-sakes",
    title: "Reuse PP Woven Bags (Sakes)",
    note: "Sold per piece (Pcs)",
    products: [
      { code: "USAK-100", name: "Used sakes — 100 kg", price: 130, unit: "pc" },
      { code: "USAK-50", name: "Used sakes — 50 kg", price: 110, unit: "pc" },
      { code: "USAK-25", name: "Used sakes — 25 kg", price: 90, unit: "pc" },
    ],
  },
  {
    id: "reuse-corrboxes",
    title: "Reuse CorrBoxes (Paper Cartons)",
    note: "Price per kg",
    products: [
      { code: "RCB-STR-BIG", name: "Strong CorrBoxes — Big", price: 350, unit: "kg" },
      { code: "RCB-STR-SML", name: "Strong CorrBoxes — Small", price: 350, unit: "kg" },
      { code: "RCB-SFT-BIG", name: "Soft CorrBoxes — Big", price: 350, unit: "kg" },
      { code: "RCB-SFT-SML", name: "Soft CorrBoxes — Small", price: 350, unit: "kg" },
    ],
  },
  {
    id: "plastic-waste",
    title: "Plastic Waste",
    note: "Price per kg",
    products: [
      { code: "PW-G1", name: "Plastic Waste — Grade 1", price: 250, unit: "kg" },
      { code: "PW-G2", name: "Plastic Waste — Grade 2", price: 120, unit: "kg" },
    ],
  },
  {
    id: "paper-egg",
    title: "Paper Roll & Egg Trays",
    products: [
      { code: "PAPR", name: "Paper roll", price: 800, unit: "kg" },
      { code: "EGGT", name: "Egg trays", price: 200, unit: "pc" },
    ],
  },
  {
    id: "corrugated-boxes",
    title: "Corrugated Boxes",
    note: "Sold per piece",
    products: [
      { code: "COR-BX-01", name: "COR-BX-01", price: 3000, unit: "pc" },
      { code: "COR-BX-02", name: "COR-BX-02", price: 3400, unit: "pc" },
      { code: "COR-BX-03", name: "COR-BX-03", price: 3800, unit: "pc" },
      { code: "COR-BX-04", name: "COR-BX-04", price: 4300, unit: "pc" },
    ],
  },
  {
    id: "paper-bags",
    title: "Paper Bags (Envelopes)",
    note: "Price per kg",
    products: [
      { code: "ENV-01", name: "ENV-01", price: 2400, unit: "kg" },
      { code: "ENV-02", name: "ENV-02", price: 2300, unit: "kg" },
      { code: "ENV-03", name: "ENV-03", price: 2200, unit: "kg" },
      { code: "ENV-05", name: "ENV-05", price: 2100, unit: "kg" },
      { code: "ENV-08", name: "ENV-08", price: 2000, unit: "kg" },
      { code: "ENV-10", name: "ENV-10", price: 1900, unit: "kg" },
      { code: "ENV-12", name: "ENV-12", price: 1800, unit: "kg" },
      { code: "ENV-14", name: "ENV-14", price: 1800, unit: "kg" },
      { code: "ENV-16", name: "ENV-16", price: 1800, unit: "kg" },
      { code: "ENV-25", name: "ENV-25", price: 1800, unit: "kg" },
      { code: "ENV-50", name: "ENV-50", price: 3800, unit: "kg" },
    ],
  },
  {
    id: "pp-woven-pcs",
    title: "PP Woven Bags (Sakes)",
    note: "Sold per piece",
    products: [
      { code: "PP-WVN-BG-100", name: "PP-WVN-BG-100", price: 280, unit: "pc" },
      { code: "PP-WVN-BG-50", name: "PP-WVN-BG-50", price: 220, unit: "pc" },
      { code: "PP-WVN-BG-25", name: "PP-WVN-BG-25", price: 230, unit: "pc" },
      { code: "PP-WVN-BG-10", name: "PP-WVN-BG-10", price: 115, unit: "pc" },
      { code: "PP-WVN-BG-05", name: "PP-WVN-BG-05", price: 70, unit: "pc" },
      { code: "PP-WVN-BG-2.5", name: "PP-WVN-BG-2.5", price: 65, unit: "pc" },
    ],
  },
  {
    id: "biodeg-polybags",
    title: "Biodegradable Poly Bags (Food grade)",
    note: "Price per kg",
    products: [
      { code: "BD-PLY-BG-50", name: "BD-PLY-BG-50", price: 3600, unit: "kg" },
      { code: "BD-PLY-BG-25", name: "BD-PLY-BG-25", price: 3200, unit: "kg" },
      { code: "BD-PLY-BG-2", name: "BD-PLY-BG-2", price: 2500, unit: "kg" },
      { code: "BD-PLY-BG-1", name: "BD-PLY-BG-1", price: 2200, unit: "kg" },
    ],
  },
  {
    id: "biodeg-seedling",
    title: "Biodegradable Seedling PolyPots",
    note: "Price per kg",
    products: [
      { code: "BP-SD-PPT-1", name: "BP-SD-PPT-1", price: 2200, unit: "kg" },
      { code: "BP-SD-PPT-2", name: "BP-SD-PPT-2", price: 2100, unit: "kg" },
      { code: "BP-SD-PPT-3", name: "BP-SD-PPT-3", price: 2000, unit: "kg" },
      { code: "BP-SD-PPT-4", name: "BP-SD-PPT-4", price: 1900, unit: "kg" },
      { code: "BP-SD-PPT-5", name: "BP-SD-PPT-5", price: 1800, unit: "kg" },
    ],
  },
  {
    id: "biodeg-grafting",
    title: "Biodegradable Grafting Polythene",
    note: "Single Layer • per kg",
    products: [
      { code: "BD-GP-1", name: "BD-GP-1 (Single Layer)", price: 1000, unit: "kg" },
      { code: "BD-GP-2", name: "BD-GP-2 (Single Layer)", price: 7500, unit: "kg" },
    ],
  },
];

const fmt = (n: number) => `${n.toLocaleString()} RWF`;

const LogisticsDelivery = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [itemType, setItemType] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [qty, setQty] = useState("1");

  const selected = useMemo(() => {
    if (!selectedCode) return null;
    for (const c of categories) {
      const p = c.products.find((x) => x.code === selectedCode);
      if (p) return { ...p, category: c.title };
    }
    return null;
  }, [selectedCode]);

  const itemsTotal = selected ? selected.price * (parseInt(qty) || 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      navigate("/login");
      return;
    }
    setLoading(true);
    const itemDescription = selected
      ? `${selected.category} — ${selected.name} (${selectedCode}) × ${qty} ${selected.unit} @ ${fmt(selected.price)}/${selected.unit} = ${fmt(itemsTotal)}${itemType ? ` | ${itemType}` : ""}`
      : itemType;
    const { error } = await (supabase as any).from("logistics_requests").insert({
      user_id: user.id,
      pickup,
      dropoff,
      weight: weight ? parseFloat(weight) : 0,
      preferred_date: date || null,
      full_name: fullName,
      phone,
      item_type: itemDescription,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your delivery request has been submitted." });
      setPickup(""); setDropoff(""); setWeight(""); setDate("");
      setFullName(""); setPhone(""); setItemType("");
      setSelectedCode(""); setQty("1");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative py-20 overflow-hidden">
        {/* Sliding trucks background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden opacity-30 dark:opacity-20">
          <img src={truck1} alt="" loading="lazy" className="absolute top-[8%] left-0 h-20 md:h-28 w-auto animate-truck-slide" style={{ animationDelay: "0s" }} />
          <img src={truck2} alt="" loading="lazy" className="absolute top-[35%] left-0 h-24 md:h-32 w-auto animate-truck-slide-reverse" style={{ animationDelay: "-6s" }} />
          <img src={truck3} alt="" loading="lazy" className="absolute top-[62%] left-0 h-20 md:h-28 w-auto animate-truck-slide" style={{ animationDelay: "-12s", animationDuration: "22s" }} />
          <img src={truck1} alt="" loading="lazy" className="absolute top-[85%] left-0 h-16 md:h-24 w-auto animate-truck-slide-reverse" style={{ animationDelay: "-3s", animationDuration: "28s" }} />
        </div>
        <div className="container relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/logistics" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to Logistics
            </Link>
            <Link to="/logistics/history" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <History className="h-4 w-4" /> My Requests
            </Link>
          </div>
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.logistics")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{t("logistics.title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("logistics.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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

          {/* Price catalogue */}
          <div className="space-y-10 max-w-6xl mx-auto mb-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-display font-bold">Logistics Price List</h2>
              <p className="text-muted-foreground text-sm">
                Official ISOKO catalogue. Click any item to add it to your delivery request.
              </p>
            </div>
            {categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-baseline justify-between mb-3 px-1">
                  <h3 className="text-lg md:text-xl font-display font-bold">{cat.title}</h3>
                  {cat.note && <span className="text-xs text-muted-foreground">{cat.note}</span>}
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">Code</th>
                        <th className="text-left px-4 py-2 font-medium">Product</th>
                        <th className="text-right px-4 py-2 font-medium">Selling price</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.products.map((p) => {
                        const isSel = selectedCode === p.code;
                        return (
                          <tr
                            key={p.code}
                            className={`border-t border-border transition-colors ${isSel ? "bg-primary/10" : "hover:bg-muted/30"}`}
                          >
                            <td className="px-4 py-2 font-mono text-xs">{p.code}</td>
                            <td className="px-4 py-2">{p.name}</td>
                            <td className="px-4 py-2 text-right font-semibold text-primary whitespace-nowrap">
                              {fmt(p.price)} <span className="text-xs text-muted-foreground font-normal">/ {p.unit}</span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                size="sm"
                                variant={isSel ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedCode(p.code);
                                  document.getElementById("logi-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                {isSel ? "Selected" : "Select"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div id="logi-form" className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8 scroll-mt-24">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">{t("logistics.requestTitle")}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {selected && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{selected.category}</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{selected.name}</p>
                    <span className="font-bold text-primary whitespace-nowrap">
                      {fmt(selected.price)} / {selected.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Label htmlFor="qty" className="text-xs">Qty ({selected.unit})</Label>
                    <Input id="qty" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="h-8 w-24" />
                    <span className="text-sm text-muted-foreground ml-auto">
                      Total: <span className="font-semibold text-foreground">{fmt(itemsTotal)}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="07XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup">{t("logistics.pickup")}</Label>
                <Input id="pickup" placeholder="Enter pickup address" value={pickup} onChange={(e) => setPickup(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">{t("logistics.dropoff")}</Label>
                <Input id="dropoff" placeholder="Enter drop-off address" value={dropoff} onChange={(e) => setDropoff(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-type">{selected ? "Extra notes (optional)" : "Type of Item"}</Label>
                <Input
                  id="item-type"
                  placeholder={selected ? "Any specific instructions" : "e.g., Furniture, Electronics, Food, Documents"}
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  required={!selected}
                />
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

export default LogisticsDelivery;
