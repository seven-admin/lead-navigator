import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Import from "@/pages/Import";
import UsersAdmin from "@/pages/admin/Users";
import StatusManagement from "@/pages/admin/StatusManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />
            <Route
              path="/leads"
              element={
                <MainLayout>
                  <Leads />
                </MainLayout>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <MainLayout>
                  <LeadDetail />
                </MainLayout>
              }
            />
            <Route
              path="/import"
              element={
                <MainLayout>
                  <Import />
                </MainLayout>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <MainLayout>
                  <UsersAdmin />
                </MainLayout>
              }
            />
            <Route
              path="/admin/status"
              element={
                <MainLayout>
                  <StatusManagement />
                </MainLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
