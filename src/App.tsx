
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RequestsPage from "./pages/RequestsPage";
import NewRequestPage from "./pages/NewRequestPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import ClientViewPage from "./pages/ClientViewPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProcurementProvider } from "./contexts/ProcurementContext";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";

// Add a link to favicon and metadata
const addFavicon = () => {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.href = 'https://static.wixstatic.com/media/bda159_4c1aeb4ff1664028a8d67ea7ce0ac8fd~mv2.png';
  document.head.appendChild(favicon);
  
  // Update title
  document.title = 'MGP Procurement Management';
  
  // Add meta tags for social sharing
  const metaDescription = document.createElement('meta');
  metaDescription.name = 'description';
  metaDescription.content = 'MGP Procurement Management System';
  document.head.appendChild(metaDescription);
  
  const ogTitle = document.createElement('meta');
  ogTitle.setAttribute('property', 'og:title');
  ogTitle.content = 'MGP Procurement Management';
  document.head.appendChild(ogTitle);
  
  const ogImage = document.createElement('meta');
  ogImage.setAttribute('property', 'og:image');
  ogImage.content = 'https://static.wixstatic.com/media/bda159_4c1aeb4ff1664028a8d67ea7ce0ac8fd~mv2.png';
  document.head.appendChild(ogImage);
};

// Execute once when the app loads
if (typeof window !== 'undefined') {
  addFavicon();
}

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <ProcurementProvider currentUser={user}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/new" element={<NewRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/client" element={<ClientViewPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ProcurementProvider>
  );
};

// Important: React components need to be in the correct order
// with providers properly nested
const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
