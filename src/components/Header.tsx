import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Globe, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import logo from "@/assets/isoko-logo.jpeg";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationsBell from "@/components/NotificationsBell";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.logistics"), path: "/logistics" },
    { label: t("nav.packaging"), path: "/packaging" },
    { label: t("nav.marketplace"), path: "/marketplace" },
    { label: t("nav.elibrary"), path: "/e-library" },
    { label: t("nav.entertainment"), path: "/entertainment" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ISOKO GROUP" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-xl font-bold font-display tracking-tight">
            ISOKO <span className="text-primary">GROUP</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                location.pathname === item.path ? "text-primary" : "text-foreground/70"
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setLang(lang === "en" ? "rw" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "RW" : "EN"}
          </button>
          <Link to="/cart" aria-label="Cart">
            <Button variant="ghost" size="icon"><ShoppingCart className="h-4 w-4" /></Button>
          </Link>
          {user && <NotificationsBell />}
          {user ? (
            <>
              <Link to="/my-orders">
                <Button variant="ghost" size="sm">Orders</Button>
              </Link>
              <Link to="/seller">
                <Button variant="outline" size="sm">Seller</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">{t("nav.admin")}</Button>
                </Link>
              )}
              <Link to="/subscription">
                <Button variant="outline" size="sm">Plan</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={handleLogout}>{t("nav.logout")}</Button>
            </>
          ) : (
            <>
              <Link to="/become-seller">
                <Button variant="outline" size="sm">{t("nav.becomeSeller")}</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">{t("nav.login")}</Button>
              </Link>
            </>
          )}
        </div>

        <div className="xl:hidden flex items-center gap-1">
          {user && <NotificationsBell />}
          <ThemeToggle />
          <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container flex flex-col py-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-4 py-2">
              <button
                onClick={() => setLang(lang === "en" ? "rw" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted"
              >
                <Globe className="h-3.5 w-3.5" />
                {lang === "en" ? "Kinyarwanda" : "English"}
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-4 px-4">
              {user ? (
                <>
                  <Link to="/my-orders" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">My Orders</Button>
                  </Link>
                  <Link to="/seller" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Seller Dashboard</Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">{t("nav.admin")}</Button>
                    </Link>
                  )}
                  <Link to="/subscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Subscription</Button>
                  </Link>
                  <Button className="w-full" onClick={() => { handleLogout(); setMobileOpen(false); }}>{t("nav.logout")}</Button>
                </>
              ) : (
                <>
                  <Link to="/become-seller" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">{t("nav.becomeSeller")}</Button>
                  </Link>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">{t("nav.login")}</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
