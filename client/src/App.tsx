import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Documents from "@/pages/documents";
import QrCodePage from "@/pages/qr-code";
import DoctorView from "@/pages/doctor-view";
import DoctorDashboard from "@/pages/doctor-dashboard";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Check if we're in the auth view or doctor view
  const isAuthPage = location === "/auth";
  const isDoctorView = location.startsWith("/doctor") && !location.includes("dashboard");
  
  // Don't show layout elements on these special pages
  if (isAuthPage || isDoctorView || !user) {
    return <AppRoutes />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <AppRoutes />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/doctor/:token" component={DoctorView} />
      <Route path="/doctor" component={DoctorView} />
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/doctor-dashboard" component={DoctorDashboard} roles={["doctor"]} />
      <ProtectedRoute path="/documents" component={Documents} roles={["patient"]} />
      <ProtectedRoute path="/qr-code" component={QrCodePage} roles={["patient"]} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
