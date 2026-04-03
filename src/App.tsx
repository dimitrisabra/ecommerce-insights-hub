import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import UserSalesPage from "./pages/UserSalesPage";
import ForecastPage from "./pages/ForecastPage";
import UserTargetsPage from "./pages/UserTargetsPage";
import UserNotificationsPage from "./pages/UserNotificationsPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import UserMessagesPage from "./pages/UserMessagesPage";
import UserFeedbackPage from "./pages/UserFeedbackPage";
import UserHelpPage from "./pages/UserHelpPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSales from "./pages/AdminSales";
import AdminActivityPage from "./pages/AdminActivityPage";
import AdminTargetsPage from "./pages/AdminTargetsPage";
import AdminAnnouncementsPage from "./pages/AdminAnnouncementsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminCouponsPage from "./pages/AdminCouponsPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import NotFound from "./pages/NotFound";
import SiteChatbot from "./components/SiteChatbot";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/sales" element={<ProtectedRoute><UserSalesPage /></ProtectedRoute>} />
              <Route path="/dashboard/forecast" element={<ProtectedRoute><ForecastPage /></ProtectedRoute>} />
              <Route path="/dashboard/targets" element={<ProtectedRoute><UserTargetsPage /></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><UserNotificationsPage /></ProtectedRoute>} />
              <Route path="/dashboard/messages" element={<ProtectedRoute><UserMessagesPage /></ProtectedRoute>} />
              <Route path="/dashboard/feedback" element={<ProtectedRoute><UserFeedbackPage /></ProtectedRoute>} />
              <Route path="/dashboard/help" element={<ProtectedRoute><UserHelpPage /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/sales" element={<ProtectedRoute><AdminSales /></ProtectedRoute>} />
              <Route path="/admin/activity" element={<ProtectedRoute><AdminActivityPage /></ProtectedRoute>} />
              <Route path="/admin/targets" element={<ProtectedRoute><AdminTargetsPage /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncementsPage /></ProtectedRoute>} />
              <Route path="/admin/coupons" element={<ProtectedRoute><AdminCouponsPage /></ProtectedRoute>} />
              <Route path="/admin/feedback" element={<ProtectedRoute><AdminFeedbackPage /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute><AdminMessagesPage /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SiteChatbot />
          </>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
