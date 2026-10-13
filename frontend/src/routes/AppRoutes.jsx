import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LocationsPage from '../pages/public/LocationsPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ContactPage from '../pages/public/ContactPage';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import BrowseSlotsPage from '../pages/customer/BrowseSlotsPage';
import MyReservationsPage from '../pages/customer/MyReservationsPage';
import BookingDetailsPage from '../pages/customer/BookingDetailsPage';
import ActiveSessionPage from '../pages/customer/ActiveSessionPage';
import VehicleManagementPage from '../pages/customer/VehicleManagementPage';
import HistoryBillingPage from '../pages/customer/HistoryBillingPage';
import NotificationsPage from '../pages/customer/NotificationsPage';
import ProfilePage from '../pages/customer/ProfilePage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageLocationsPage from '../pages/admin/ManageLocationsPage';
import ManageSlotsPage from '../pages/admin/ManageSlotsPage';
import ManageReservationsPage from '../pages/admin/ManageReservationsPage';
import ManageCustomersPage from '../pages/admin/ManageCustomersPage';
import ManageVehiclesPage from '../pages/admin/ManageVehiclesPage';
import ActiveSessionsPage from '../pages/admin/ActiveSessionsPage';
import BillingTransactionsPage from '../pages/admin/BillingTransactionsPage';
import ReportsAnalyticsPage from '../pages/admin/ReportsAnalyticsPage';
import SensorSimulatorPage from '../pages/admin/SensorSimulatorPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Route Protectors
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/customer/dashboard" replace />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <CustomerRoute>
            <DashboardLayout />
          </CustomerRoute>
        }
      >
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="slots" element={<BrowseSlotsPage />} />
        <Route path="reservations" element={<MyReservationsPage />} />
        <Route path="reservations/:id" element={<BookingDetailsPage />} />
        <Route path="active-session" element={<ActiveSessionPage />} />
        <Route path="vehicles" element={<VehicleManagementPage />} />
        <Route path="history" element={<HistoryBillingPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="locations" element={<ManageLocationsPage />} />
        <Route path="slots" element={<ManageSlotsPage />} />
        <Route path="reservations" element={<ManageReservationsPage />} />
        <Route path="sessions" element={<ActiveSessionsPage />} />
        <Route path="customers" element={<ManageCustomersPage />} />
        <Route path="vehicles" element={<ManageVehiclesPage />} />
        <Route path="payments" element={<BillingTransactionsPage />} />
        <Route path="reports" element={<ReportsAnalyticsPage />} />
        <Route path="sensor-simulator" element={<SensorSimulatorPage />} />
        <Route path="profile" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
