import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";
import SubscriptionRequired from "@/components/SubscriptionRequired";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading, reason } = useSubscription();

  if (authLoading || subLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isActive && reason) return <SubscriptionRequired reason={reason} />;

  return <>{children}</>;
};

export default ProtectedRoute;
