import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const roleFromMetadata =
      user.app_metadata?.role === "admin" ||
      user.user_metadata?.role === "admin" ||
      user.user_metadata?.app_role === "admin" ||
      user.app_metadata?.app_role === "admin";

    if (roleFromMetadata) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };
    check();
  }, [user]);

  return { isAdmin, loading };
};
