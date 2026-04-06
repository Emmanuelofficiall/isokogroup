import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Logistics from "./pages/Logistics";
import Packaging from "./pages/Packaging";
import Marketplace from "./pages/Marketplace";
import ELibrary from "./pages/ELibrary";
import Login from "./pages/Login";
import BecomeSeller from "./pages/BecomeSeller";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/e-library" element={<ELibrary />} />
          <Route path="/login" element={<Login />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
