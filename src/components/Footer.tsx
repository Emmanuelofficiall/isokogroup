import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/isoko-logo.jpeg";

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-card text-foreground border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="ISOKO GROUP" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xl font-bold font-display">ISOKO GROUP</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">{t("footer.services")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/logistics" className="hover:text-primary transition-colors">{t("nav.logistics")}</Link></li>
              <li><Link to="/packaging" className="hover:text-primary transition-colors">{t("nav.packaging")}</Link></li>
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">{t("nav.marketplace")}</Link></li>
              <li><Link to="/e-library" className="hover:text-primary transition-colors">{t("nav.elibrary")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">{t("footer.company")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/become-seller" className="hover:text-primary transition-colors">{t("nav.becomeSeller")}</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">{t("nav.login")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">{t("footer.contact")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@isokogroup.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +250 788 000 000</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Kigali, Rwanda</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ISOKO GROUP. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
