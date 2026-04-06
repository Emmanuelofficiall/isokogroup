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
    setLoading(true);
    const { error } = await supabase.from("seller_applications").insert({
      user_id: user.id,
      full_name: fullname,
      business_name: business,
      email,
      phone,
      id_number: idNumber,
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
            <h2 className="text-xl font-semibold mb-6">{t("seller.form")}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">{t("seller.fullName")}</Label>
                  <Input id="fullname" placeholder="Your full name" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business">{t("seller.businessName")}</Label>
                  <Input id="business" placeholder="Your business name" value={business} onChange={(e) => setBusiness(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("seller.phone")}</Label>
                  <Input id="phone" placeholder="+250 7XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">{t("seller.idNumber")}</Label>
                <Input id="id" placeholder="National ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
              </div>
              <Button className="w-full" size="lg" disabled={loading}>
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
