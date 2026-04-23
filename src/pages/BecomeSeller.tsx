import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const rules = [
  "10% monthly commission on profits",
  "Products must meet quality standards",
  "ID verification required",
  "Active subscription required (50 RWF)",
];

const BecomeSeller = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fullname, setFullname] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      navigate("/login");
      return;
    }

    // Strict validation — all fields required and properly formatted
    const trimmedName = fullname.trim();
    const trimmedBusiness = business.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedId = idNumber.trim();

    if (!trimmedName || trimmedName.length < 3) {
      toast({ title: "Invalid full name", description: "Please enter your full legal name (at least 3 characters).", variant: "destructive" });
      return;
    }
    if (!trimmedBusiness || trimmedBusiness.length < 2) {
      toast({ title: "Invalid business name", description: "Please enter a valid business name.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!/^\+?[\d\s-]{8,15}$/.test(trimmedPhone)) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number (8-15 digits).", variant: "destructive" });
      return;
    }
    if (!trimmedId || trimmedId.length < 6) {
      toast({ title: "Invalid ID", description: "Please enter your full national ID number.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await (supabase as any).from("seller_applications").insert({
      user_id: user.id,
      full_name: trimmedName,
      business_name: trimmedBusiness,
      email: trimmedEmail,
      phone: trimmedPhone,
      id_number: trimmedId,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application Submitted!", description: "We will review your application and get back to you soon." });
      setFullname(""); setBusiness(""); setEmail(""); setPhone(""); setIdNumber("");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container max-w-2xl">
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("seller.title")}</span>
            <h1 className="text-4xl font-display font-bold">{t("seller.title")}</h1>
            <p className="text-muted-foreground">{t("seller.subtitle")}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("seller.rules")}</h2>
            <ul className="space-y-3">
              {rules.map((r) => (
                <li key={r} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold mb-2">{t("seller.form")}</h2>
            <p className="text-sm text-muted-foreground mb-6">All fields are required. Please provide accurate information — applications with missing or invalid details will be rejected.</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">{t("seller.fullName")} *</Label>
                  <Input id="fullname" placeholder="Your full legal name" value={fullname} onChange={(e) => setFullname(e.target.value)} required minLength={3} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business">{t("seller.businessName")} *</Label>
                  <Input id="business" placeholder="Your business name" value={business} onChange={(e) => setBusiness(e.target.value)} required minLength={2} maxLength={100} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")} *</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("seller.phone")} *</Label>
                  <Input id="phone" type="tel" placeholder="+250 7XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={8} maxLength={20} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">{t("seller.idNumber")} *</Label>
                <Input id="id" placeholder="National ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required minLength={6} maxLength={30} />
              </div>
              <Button className="w-full hover-glow" size="lg" disabled={loading}>
                {loading ? "Submitting..." : t("seller.submit")}
              </Button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomeSeller;
