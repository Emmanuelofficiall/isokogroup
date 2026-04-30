import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { SubscriptionProvider } from "@/lib/subscription";
import { ThemeProvider } from "@/lib/theme";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Logistics from "./pages/Logistics";
import Packaging from "./pages/Packaging";
import Marketplace from "./pages/Marketplace";
import ELibrary from "./pages/ELibrary";
import Entertainment from "./pages/Entertainment";
import Login from "./pages/Login";
import BecomeSeller from "./pages/BecomeSeller";
import Admin from "./pages/Admin";
import SellerDashboard from "./pages/SellerDashboard";
import Subscription from "./pages/Subscription";
import Cart from "./pages/Cart";
import BuyerOrders from "./pages/BuyerOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/become-seller" element={<BecomeSeller />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/logistics" element={<ProtectedRoute><Logistics /></ProtectedRoute>} />
                  <Route path="/packaging" element={<ProtectedRoute><Packaging /></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/e-library" element={<ProtectedRoute><ELibrary /></ProtectedRoute>} />
                  <Route path="/entertainment" element={<ProtectedRoute><Entertainment /></ProtectedRoute>} />
                  <Route path="/seller" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/my-orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
