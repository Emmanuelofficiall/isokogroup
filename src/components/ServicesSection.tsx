import { Truck, Package, ShoppingBag, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Truck,
    title: "Logistics",
    description: "Request deliveries, track in real-time, and manage your shipping with our reliable logistics network.",
    path: "/logistics",
  },
  {
    icon: Package,
    title: "Packaging",
    description: "Professional packaging services with multiple options, price estimates, and scheduled pickups.",
    path: "/packaging",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Browse products, connect with sellers, and enjoy a seamless shopping experience with order tracking.",
    path: "/marketplace",
  },
  {
    icon: BookOpen,
    title: "E-Library",
    description: "Access a rich collection of books online. Read, bookmark, and track your reading progress.",
    path: "/e-library",
  },
];

const ServicesSection = () => (
  <section className="py-20 md:py-28">
    <div className="container">
      <div className="text-center mb-16 space-y-4">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Services</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold">Everything You Need in One Place</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From logistics to digital learning, ISOKO GROUP delivers comprehensive solutions tailored to your needs.
        </p>
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
              Learn more <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
