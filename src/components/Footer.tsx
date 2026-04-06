import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/isoko-logo.jpeg";

const Footer = () => (
  <footer className="bg-foreground text-background">
    <div className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ISOKO GROUP" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xl font-bold font-display">ISOKO GROUP</span>
          </div>
          <p className="text-sm text-background/60 leading-relaxed">
            Everything You Need in One Platform — Logistics, Marketplace & Knowledge Combined.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
          <ul className="space-y-3 text-sm text-background/60">
            <li><Link to="/logistics" className="hover:text-primary transition-colors">Logistics</Link></li>
            <li><Link to="/packaging" className="hover:text-primary transition-colors">Packaging</Link></li>
            <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
            <li><Link to="/e-library" className="hover:text-primary transition-colors">E-Library</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-3 text-sm text-background/60">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/become-seller" className="hover:text-primary transition-colors">Become a Seller</Link></li>
            <li><Link to="/login" className="hover:text-primary transition-colors">Login / Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm text-background/60">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@isokogroup.com</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +250 788 000 000</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Kigali, Rwanda</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm text-background/40">
        © {new Date().getFullYear()} ISOKO GROUP. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
