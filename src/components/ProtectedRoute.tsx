import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();

  if (authLoading || subLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isActive) return <Navigate to="/subscription" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
