import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/isoko-logo.jpeg";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Logistics", path: "/logistics" },
  { label: "Packaging", path: "/packaging" },
  { label: "Marketplace", path: "/marketplace" },
  { label: "E-Library", path: "/e-library" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ISOKO GROUP" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-xl font-bold font-display tracking-tight">
            ISOKO <span className="text-primary">GROUP</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.path ? "text-primary" : "text-foreground/70"
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/become-seller">
            <Button variant="outline" size="sm">Become a Seller</Button>
          </Link>
          <Link to="/login">
            <Button size="sm">Login / Register</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
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
            <div className="flex flex-col gap-2 mt-4 px-4">
              <Link to="/become-seller" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Become a Seller</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Login / Register</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
