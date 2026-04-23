import { Link } from "react-router-dom";
import { Lock, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  reason: "no_subscription" | "expired";
};

const SubscriptionRequired = ({ reason }: Props) => {
  const expired = reason === "expired";
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16 flex items-center justify-center">
        <div className="max-w-lg w-full rounded-2xl border border-border bg-card p-8 text-center space-y-6 shadow-sm">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {expired ? (
              <Clock className="h-8 w-8 text-primary" />
            ) : (
              <Lock className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold">
              {expired ? "Your subscription has expired" : "Subscription required"}
            </h1>
            <p className="text-muted-foreground">
              {expired
                ? "Renew your plan for 50 RWF to keep accessing Logistics, Packaging, Marketplace, and the E-Library."
                : "Start your free 1-week trial or subscribe for 50 RWF/month to unlock all ISOKO GROUP services."}
            </p>
          </div>
          <Link to="/subscription" className="block">
            <Button size="lg" className="w-full gap-2">
              <CreditCard className="h-4 w-4" />
              {expired ? "Renew subscription" : "Go to subscription"}
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            {expired
              ? "Pay via Mobile Money, Card, or PayPal."
              : "No payment required to start the free trial."}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionRequired;
