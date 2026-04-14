import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";

import PatientLayout from "./layouts/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import LogVitalsPage from "./pages/patient/LogVitalsPage";
import HealthTrendsPage from "./pages/patient/HealthTrendsPage";
import MedicationsPage from "./pages/patient/MedicationsPage";
import NutritionPage from "./pages/patient/NutritionPage";
import SleepPage from "./pages/patient/SleepPage";
import FitnessPage from "./pages/patient/FitnessPage";
import NearbyServicesPage from "./pages/patient/NearbyServicesPage";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PatientManagementPage from "./pages/admin/PatientManagementPage";
import PatientDetailPage from "./pages/admin/PatientDetailPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminDataExplorerPage from "./pages/admin/AdminDataExplorerPage";
import MedicineShopsManagementPage from "./pages/admin/MedicineShopsManagementPage";
import HospitalsManagementPage from "./pages/admin/HospitalsManagementPage";
import DoctorsManagementPage from "./pages/admin/DoctorsManagementPage";
import NursingHomesManagementPage from "./pages/admin/NursingHomesManagementPage";

import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, role, loading } = useAuth();
  
  // If user isn't authenticated, show login
  if (!user) return <Navigate to="/login" replace />;
  
  // If user is authenticated and role is loaded, redirect to dashboard
  if (!loading && user) {
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  
  // Show loading only if user is authenticated but role is still loading
  if (loading && user) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }
  
  // Default to login
  return <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient routes */}
            <Route element={<ProtectedRoute requiredRole="patient"><PatientLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<PatientDashboard />} />
              <Route path="/vitals" element={<LogVitalsPage />} />
              <Route path="/trends" element={<HealthTrendsPage />} />
              <Route path="/medications" element={<MedicationsPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/sleep" element={<SleepPage />} />
              <Route path="/fitness" element={<FitnessPage />} />
              <Route path="/nearby" element={<NearbyServicesPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/patients" element={<PatientManagementPage />} />
              <Route path="/admin/patients/:userId" element={<PatientDetailPage />} />
              <Route path="/admin/data" element={<AdminDataExplorerPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/medicine-shops" element={<MedicineShopsManagementPage />} />
              <Route path="/admin/hospitals" element={<HospitalsManagementPage />} />
              <Route path="/admin/doctors" element={<DoctorsManagementPage />} />
              <Route path="/admin/nursing-homes" element={<NursingHomesManagementPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
