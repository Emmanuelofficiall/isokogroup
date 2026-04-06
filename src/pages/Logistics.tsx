import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, MapPin, Clock, Calculator } from "lucide-react";

const features = [
  { icon: Truck, title: "Request Delivery", desc: "Submit delivery requests with pickup and drop-off details." },
  { icon: MapPin, title: "Real-time Tracking", desc: "Track your shipments live on an interactive map." },
  { icon: Calculator, title: "Pricing Calculator", desc: "Get instant price estimates based on distance and weight." },
  { icon: Clock, title: "Order History", desc: "View all your past and ongoing deliveries in one place." },
];

const Logistics = () => (
  <div className="min-h-screen">
    <Header />
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Logistics</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Reliable Delivery Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Fast, secure, and trackable logistics across Rwanda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 hover-lift text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8">
          <h2 className="text-2xl font-display font-bold mb-6 text-center">Request a Delivery</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input id="pickup" placeholder="Enter pickup address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff">Drop-off Location</Label>
              <Input id="dropoff" placeholder="Enter drop-off address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input id="date" type="date" />
              </div>
            </div>
            <Button className="w-full" size="lg">Submit Request</Button>
          </form>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Logistics;
