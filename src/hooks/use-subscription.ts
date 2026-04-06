import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Subscription = {
  id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  trial_ends_at: string | null;
  amount: number;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSub = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        // Check if trial/subscription expired
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;

        if (data.status === "trial" && trialEndsAt && now > trialEndsAt) {
          // Trial expired — need payment
          setSubscription({ ...data, status: "expired" });
        } else if (data.status === "active" && now > expiresAt) {
          setSubscription({ ...data, status: "expired" });
        } else {
          setSubscription(data);
        }
      }
      setLoading(false);
    };

    fetchSub();
  }, [user]);

  const startTrial = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan: "basic",
        amount: 50,
        status: "trial",
      })
      .select()
      .single();

    if (!error && data) setSubscription(data);
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

    if (!error && data) setSubscription(data);
    return { data, error };
  };

  const isActive = subscription?.status === "trial" || subscription?.status === "active";

  return { subscription, loading, isActive, startTrial, activateSubscription };
};
