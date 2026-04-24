import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type SubscriptionStatus = "trial" | "active" | "expired" | "none";

export type Subscription = {
  id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  trial_ends_at: string | null;
  amount: number;
};

type SubscriptionContextType = {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  status: SubscriptionStatus;
  reason: "no_subscription" | "expired" | null;
  refresh: () => Promise<void>;
  startTrial: () => Promise<{ data: any; error: any } | undefined>;
  activateSubscription: () => Promise<{ data: any; error: any } | undefined>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({} as SubscriptionContextType);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSub = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;

      if (data.status === "trial" && trialEndsAt && now > trialEndsAt) {
        setSubscription({ ...data, status: "expired" });
      } else if (data.status === "active" && now > expiresAt) {
        setSubscription({ ...data, status: "expired" });
      } else {
        setSubscription(data);
      }
    } else {
      setSubscription(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    fetchSub();
  }, [authLoading, fetchSub]);

  const startTrial = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ user_id: user.id, plan: "basic", amount: 200, status: "trial" })
      .select()
      .single();
    if (!error && data) setSubscription(data as Subscription);
    return { data, error };
  };

  const activateSubscription = async () => {
    if (!user || !subscription) return;
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", subscription.id)
      .select()
      .single();
    if (!error && data) setSubscription(data as Subscription);
    return { data, error };
  };

  const isActive = subscription?.status === "trial" || subscription?.status === "active";
  const status: SubscriptionStatus = !subscription
    ? "none"
    : (subscription.status as SubscriptionStatus);
  const reason: "no_subscription" | "expired" | null = isActive
    ? null
    : !subscription
    ? "no_subscription"
    : "expired";

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading: loading || authLoading,
        isActive,
        status,
        reason,
        refresh: fetchSub,
        startTrial,
        activateSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
