import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CTASection = () => {
  const { t } = useI18n();
  const benefits = [
    t("cta.benefit1"),
    t("cta.benefit2"),
    t("cta.benefit3"),
    t("cta.benefit4"),
  ];

  return (
    <section className="py-20 bg-card text-foreground relative overflow-hidden border-y border-border">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("cta.joinToday")}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold">
            {t("cta.title")} <span className="text-primary">50 RWF</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t("cta.subtitle")}</p>

          <ul className="flex flex-col items-start max-w-md mx-auto gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <Link to="/login">
            <Button size="lg" className="gap-2 text-base px-10 mt-4">
              {t("cta.getStarted")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
