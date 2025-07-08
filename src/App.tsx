import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import React from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";
import Artists from "./pages/Artists";
import ArtistDetail from "./pages/ArtistDetail";
import Categories from "./pages/Categories";
import About from "./pages/About";
import JoinAsArtist from "./pages/JoinAsArtist";
import ArtistLogin from "./pages/ArtistLogin";
import UserLogin from "./pages/UserLogin";
import ClientRegister from "./pages/ClientRegister";
import ClientDashboard from "./pages/ClientDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ArtistProtectedRoute from "@/components/ArtistProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import PendingApproval from "./pages/PendingApproval";
import ArtistDashboard from "./pages/ArtistDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PayGateTest from "./pages/PayGateTest";

const queryClient = new QueryClient();

// Client Protected Route Component
const ClientProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<any>(null);
  const [isClient, setIsClient] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Check if user is a client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (clientError || !clientData) {
        navigate('/login');
        return;
      }

      setUser(session.user);
      setIsClient(true);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return user && isClient ? <>{children}</> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/join-as-artist" element={<JoinAsArtist />} />
          <Route path="/client-register" element={<ClientRegister />} />
          <Route path="/artist-login" element={<ArtistLogin />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/paygate-test" element={<PayGateTest />} />

          {/* Protected Admin Route */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Protected Artist Routes */}
          <Route element={<ArtistProtectedRoute />}>
            <Route path="/artist/dashboard" element={<ArtistDashboard />} />
            {/* Add other protected artist routes here */}
          </Route>

          {/* Protected Client Dashboard Route */}
          <Route path="/client-dashboard" element={
            <ClientProtectedRoute>
              <ClientDashboard />
            </ClientProtectedRoute>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
