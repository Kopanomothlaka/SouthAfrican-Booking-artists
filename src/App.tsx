
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Artists from "./pages/Artists";
import ArtistDetail from "./pages/ArtistDetail";
import Categories from "./pages/Categories";
import JoinAsArtist from "./pages/JoinAsArtist";
import ArtistLogin from "./pages/ArtistLogin";
import UserLogin from "./pages/UserLogin";
import AdminDashboard from "./pages/AdminDashboard";
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
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/join-as-artist" element={<JoinAsArtist />} />
          <Route path="/artist-login" element={<ArtistLogin />} />
          <Route path="/login" element={<UserLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
