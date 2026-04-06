import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

const rules = [
  "10% monthly commission on profits",
  "Products must meet quality standards",
  "ID verification required",
  "Active subscription required (200 RWF)",
];

const BecomeSeller = () => (
  <div className="min-h-screen">
    <Header />
    <section className="py-20">
      <div className="container max-w-2xl">
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Sell on ISOKO</span>
          <h1 className="text-4xl font-display font-bold">Become a Seller</h1>
          <p className="text-muted-foreground">Join our marketplace and reach thousands of buyers across Rwanda.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Seller Rules</h2>
          <ul className="space-y-3">
            {rules.map((r) => (
              <li key={r} className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold mb-6">Registration Form</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input id="fullname" placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Business Name</Label>
                <Input id="business" placeholder="Your business name" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+250 7XX XXX XXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id">ID Number (for verification)</Label>
              <Input id="id" placeholder="National ID number" />
            </div>
            <Button className="w-full" size="lg">Submit Application</Button>
          </form>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default BecomeSeller;
