import { Truck, Package, ShoppingBag, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const ServicesSection = () => {
  const { t } = useI18n();

  const services = [
    {
      icon: Truck,
      title: t("nav.logistics"),
      description: t("hero.fastDelivery"),
      path: "/logistics",
    },
    {
      icon: Package,
      title: t("nav.packaging"),
      description: t("hero.securePacking"),
      path: "/packaging",
    },
    {
      icon: ShoppingBag,
      title: t("nav.marketplace"),
      description: t("hero.buySell"),
      path: "/marketplace",
    },
    {
      icon: BookOpen,
      title: t("nav.elibrary"),
      description: t("hero.readOnline"),
      path: "/e-library",
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("services.ourServices")}</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold">{t("services.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("services.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <Link
              key={service.title}
              to={service.path}
              className="group relative rounded-xl border border-border bg-card p-6 hover-lift"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>
              <span className="inline-flex items-center text-sm font-medium text-primary gap-1 group-hover:gap-2 transition-all">
                {t("services.learnMore")} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
