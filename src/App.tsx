import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { MainLayout } from './components/layout/MainLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewBookingPage } from './pages/NewBookingPage';
import { BookingsListPage } from './pages/BookingsListPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { BuktiPeminjamanPage } from './pages/BuktiPeminjamanPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ApprovedCancellationsPage } from './pages/ApprovedCancellationsPage';
import { RoomsPage } from './pages/RoomsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { UsersPage } from './pages/UsersPage';
import { UnitsPage } from './pages/UnitsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Route & Auth Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main Application Pages Wrapped in MainLayout */}
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/bookings/new"
              element={
                <MainLayout>
                  <NewBookingPage />
                </MainLayout>
              }
            />
            <Route
              path="/bookings"
              element={
                <MainLayout>
                  <BookingsListPage />
                </MainLayout>
              }
            />
            <Route
              path="/bookings/:id"
              element={
                <MainLayout>
                  <BookingDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/bukti/:id"
              element={
                <MainLayout>
                  <BuktiPeminjamanPage />
                </MainLayout>
              }
            />
            <Route
              path="/approvals"
              element={
                <MainLayout>
                  <ApprovalsPage />
                </MainLayout>
              }
            />
            <Route
              path="/cancellations"
              element={
                <MainLayout>
                  <ApprovedCancellationsPage />
                </MainLayout>
              }
            />
            <Route
              path="/rooms"
              element={
                <MainLayout>
                  <RoomsPage />
                </MainLayout>
              }
            />
            <Route
              path="/calendar"
              element={
                <MainLayout>
                  <CalendarPage />
                </MainLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <MainLayout>
                  <ReportsPage />
                </MainLayout>
              }
            />
            <Route
              path="/notifications"
              element={
                <MainLayout>
                  <NotificationsPage />
                </MainLayout>
              }
            />
            <Route
              path="/audit-trail"
              element={
                <MainLayout>
                  <AuditTrailPage />
                </MainLayout>
              }
            />
            <Route
              path="/users"
              element={
                <MainLayout>
                  <UsersPage />
                </MainLayout>
              }
            />
            <Route
              path="/units"
              element={
                <MainLayout>
                  <UnitsPage />
                </MainLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              }
            />

            {/* Default Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
