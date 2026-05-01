import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Truck, Box, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const Logistics = () => {
  const { t } = useI18n();

  const services = [
    {
      to: "/logistics/delivery",
      icon: Truck,
      title: "Logistics Services",
      desc: "Request deliveries, track shipments in real time, and manage your transport needs.",
    },
    {
      to: "/logistics/packaging",
      icon: Box,
      title: "Packaging Services",
      desc: "Standard, premium, express or bulk packaging — we pack and protect your goods.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.logistics")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Choose a Service</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select the service you need. You can request delivery transport or our packaging service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="group rounded-2xl border border-border bg-card p-8 hover-lift transition-all hover:border-primary"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">{s.title}</h2>
                <p className="text-muted-foreground">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Logistics;
