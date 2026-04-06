import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "rw";

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  "nav.home": { en: "Home", rw: "Ahabanza" },
  "nav.logistics": { en: "Logistics", rw: "Gutwara ibintu" },
  "nav.packaging": { en: "Packaging", rw: "Gupakira" },
  "nav.marketplace": { en: "Marketplace", rw: "Isoko" },
  "nav.elibrary": { en: "E-Library", rw: "Ibitabo" },
  "nav.becomeSeller": { en: "Become a Seller", rw: "Ba Umucuruzi" },
  "nav.login": { en: "Login / Register", rw: "Injira / Iyandikishe" },
  "nav.logout": { en: "Logout", rw: "Sohoka" },
  "nav.admin": { en: "Admin", rw: "Ubuyobozi" },

  // Hero
  "hero.badge": { en: "Welcome to ISOKO GROUP", rw: "Murakaza neza kuri ISOKO GROUP" },
  "hero.title1": { en: "Your All-in-One Platform for", rw: "Urubuga rwanyu rw'ibintu byose ku" },
  "hero.logistics": { en: "Logistics", rw: "Gutwara" },
  "hero.marketplace": { en: "Marketplace", rw: "Isoko" },
  "hero.knowledge": { en: "Knowledge", rw: "Ubumenyi" },
  "hero.subtitle": { en: "We are committed to delivering reliable services, connecting buyers and sellers, and giving you access to knowledge through our secure e-library.", rw: "Turiyemeje gutanga serivisi zizewe, guhuza abaguzi n'abacuruzi, no kubaha ubumenyi binyuze mu ibitabo byacu." },
  "hero.getStarted": { en: "Get Started", rw: "Tangira" },
  "hero.browseMarketplace": { en: "Browse Marketplace", rw: "Reba Isoko" },
  "hero.fastDelivery": { en: "Fast delivery", rw: "Kohereza byihuse" },
  "hero.securePacking": { en: "Secure packing", rw: "Gupakira neza" },
  "hero.buySell": { en: "Buy & sell", rw: "Gura & Gucuruza" },
  "hero.readOnline": { en: "Read online", rw: "Soma kuri interineti" },

  // Services
  "services.title": { en: "Everything You Need in One Place", rw: "Ibyo Ukeneye Byose Ahantu Hamwe" },
  "services.subtitle": { en: "From logistics to digital learning, ISOKO GROUP delivers comprehensive solutions tailored to your needs.", rw: "Kuva ku gutwara ibintu kugeza ku kwiga kuri interineti, ISOKO GROUP itanga ibisubizo byuzuye bikwiye ibyo ukeneye." },
  "services.learnMore": { en: "Learn more", rw: "Menya byinshi" },
  "services.ourServices": { en: "Our Services", rw: "Serivisi Zacu" },

  // Logistics
  "logistics.title": { en: "Reliable Delivery Services", rw: "Serivisi z'Ikohereza Zizewe" },
  "logistics.subtitle": { en: "Fast, secure, and trackable logistics across Rwanda.", rw: "Gutwara byihuse, byizewe, kandi bishobora gukurikiranwa mu Rwanda hose." },
  "logistics.requestDelivery": { en: "Request Delivery", rw: "Saba Ikohereza" },
  "logistics.realTimeTracking": { en: "Real-time Tracking", rw: "Gukurikirana mu gihe nyacyo" },
  "logistics.pricingCalculator": { en: "Pricing Calculator", rw: "Kubara Igiciro" },
  "logistics.orderHistory": { en: "Order History", rw: "Amateka y'Ibyo Wakoze" },
  "logistics.submitRequest": { en: "Submit Request", rw: "Ohereza Icyifuzo" },
  "logistics.requestTitle": { en: "Request a Delivery", rw: "Saba Ikohereza" },
  "logistics.pickup": { en: "Pickup Location", rw: "Aho Gufata" },
  "logistics.dropoff": { en: "Drop-off Location", rw: "Aho Gushyira" },
  "logistics.weight": { en: "Weight (kg)", rw: "Uburemere (kg)" },
  "logistics.date": { en: "Preferred Date", rw: "Itariki Ushaka" },

  // Packaging
  "packaging.title": { en: "Professional Packaging Solutions", rw: "Ibisubizo by'Ubwenge byo Gupakira" },
  "packaging.subtitle": { en: "Secure and reliable packaging for all your needs.", rw: "Gupakira byizewe ku byo ukeneye byose." },
  "packaging.requestTitle": { en: "Request Packaging", rw: "Saba Gupakira" },
  "packaging.itemDesc": { en: "Item Description", rw: "Ibisobanuro by'Igicuruzwa" },
  "packaging.quantity": { en: "Quantity", rw: "Umubare" },
  "packaging.pickupDate": { en: "Pickup Date", rw: "Itariki yo Gufata" },
  "packaging.submit": { en: "Submit Request", rw: "Ohereza Icyifuzo" },

  // Marketplace
  "marketplace.title": { en: "Shop the Best Products", rw: "Gura Ibicuruzwa Byiza" },
  "marketplace.search": { en: "Search products...", rw: "Shakisha ibicuruzwa..." },
  "marketplace.filters": { en: "Filters", rw: "Guhitamo" },
  "marketplace.addToCart": { en: "Add to Cart", rw: "Shyira mu Gatebo" },

  // E-Library
  "elibrary.title": { en: "Read & Learn Online", rw: "Soma & Wige kuri Interineti" },
  "elibrary.subtitle": { en: "Browse our collection of books and read them directly in your browser — no downloads needed.", rw: "Reba itsinda ry'ibitabo byacu ubisome mu buryo butaziguye — nta gukurura bisabwa." },
  "elibrary.search": { en: "Search books by title or author...", rw: "Shakisha ibitabo ku izina cyangwa umwanditsi..." },
  "elibrary.readNow": { en: "Read Now", rw: "Soma Nonaha" },
  "elibrary.pages": { en: "pages", rw: "impapuro" },

  // Featured
  "featured.products": { en: "Featured Products", rw: "Ibicuruzwa Byihariye" },
  "featured.books": { en: "Featured Books", rw: "Ibitabo Byihariye" },
  "featured.viewAll": { en: "View all", rw: "Reba byose" },
  "featured.browseLibrary": { en: "Browse library", rw: "Reba ibitabo" },

  // CTA
  "cta.joinToday": { en: "Join Today", rw: "Iyandikishe Uyu Munsi" },
  "cta.title": { en: "Start for Just", rw: "Tangira ku" },
  "cta.subtitle": { en: "Unlock all ISOKO GROUP services with a single affordable subscription. Pay via Mobile Money, Card, or PayPal.", rw: "Fungura serivisi zose za ISOKO GROUP n'ubwishyu bumwe bworoshye. Ishyura ukoresheje Mobile Money, Ikarita, cyangwa PayPal." },
  "cta.getStarted": { en: "Get Started Now", rw: "Tangira Nonaha" },
  "cta.benefit1": { en: "Access all services — Logistics, Packaging, Marketplace, E-Library", rw: "Koresha serivisi zose — Gutwara, Gupakira, Isoko, Ibitabo" },
  "cta.benefit2": { en: "Connect with verified sellers and buyers", rw: "Hura n'abacuruzi n'abaguzi bemejwe" },
  "cta.benefit3": { en: "Read unlimited books online", rw: "Soma ibitabo bitagira ingano kuri interineti" },
  "cta.benefit4": { en: "Real-time tracking and order management", rw: "Gukurikirana no gucunga ibyo wakoze" },

  // Auth
  "auth.welcomeBack": { en: "Welcome Back", rw: "Murakaza Neza" },
  "auth.subtitle": { en: "Login or create an account to get started.", rw: "Injira cyangwa ufungure konti kugira ngo utangire." },
  "auth.login": { en: "Login", rw: "Injira" },
  "auth.register": { en: "Register", rw: "Iyandikishe" },
  "auth.email": { en: "Email", rw: "Imeri" },
  "auth.password": { en: "Password", rw: "Ijambo ry'Ibanga" },
  "auth.fullName": { en: "Full Name", rw: "Amazina Yose" },
  "auth.createAccount": { en: "Create Account", rw: "Fungura Konti" },
  "auth.subscription": { en: "Subscription: 200 RWF to unlock all services", rw: "Kwiyandikisha: 200 RWF kugira ngo ufungure serivisi zose" },

  // Seller
  "seller.title": { en: "Become a Seller", rw: "Ba Umucuruzi" },
  "seller.subtitle": { en: "Join our marketplace and reach thousands of buyers across Rwanda.", rw: "Injira mu isoko ryacu uhure n'abaguzi ibihumbi mu Rwanda hose." },
  "seller.rules": { en: "Seller Rules", rw: "Amategeko y'Abacuruzi" },
  "seller.form": { en: "Registration Form", rw: "Ifishi yo Kwiyandikisha" },
  "seller.fullName": { en: "Full Name", rw: "Amazina Yose" },
  "seller.businessName": { en: "Business Name", rw: "Izina ry'Ubucuruzi" },
  "seller.phone": { en: "Phone", rw: "Telefoni" },
  "seller.idNumber": { en: "ID Number (for verification)", rw: "Nimero y'Indangamuntu" },
  "seller.submit": { en: "Submit Application", rw: "Ohereza Ubusabe" },

  // Footer
  "footer.services": { en: "Services", rw: "Serivisi" },
  "footer.company": { en: "Company", rw: "Ikigo" },
  "footer.contact": { en: "Contact", rw: "Twandikire" },
  "footer.tagline": { en: "Everything You Need in One Platform — Logistics, Marketplace & Knowledge Combined.", rw: "Ibyo Ukeneye Byose kuri Urubuga Rumwe — Gutwara, Isoko n'Ubumenyi Hamwe." },
  "footer.aboutUs": { en: "About Us", rw: "Abo Turi Bo" },
  "footer.rights": { en: "All rights reserved.", rw: "Uburenganzira bwose bwabikiwe." },

  // Admin
  "admin.title": { en: "Admin Dashboard", rw: "Ubuyobozi" },
  "admin.users": { en: "Users", rw: "Abakoresha" },
  "admin.orders": { en: "Orders", rw: "Ibyo Bakoze" },
  "admin.commissions": { en: "Commissions", rw: "Komisiyo" },
  "admin.analytics": { en: "Analytics", rw: "Isesengura" },
  "admin.totalUsers": { en: "Total Users", rw: "Abakoresha Bose" },
  "admin.totalOrders": { en: "Total Orders", rw: "Ibyo Bakoze Byose" },
  "admin.revenue": { en: "Revenue", rw: "Amafaranga Yinjiye" },
  "admin.commission": { en: "Commission (10%)", rw: "Komisiyo (10%)" },
};

type I18nContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: string) => translations[key]?.[lang] || key;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
