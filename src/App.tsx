import { Navigate, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { AppShell } from './components/layout/AppShell';
import { RequireAdminAccess } from './components/layout/RequireAdminAccess';
import { NotFoundPage } from './pages/NotFoundPage';
import { TrackingPage } from './pages/public/TrackingPage';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { IntegrationSettingsPage } from './pages/admin/IntegrationSettingsPage';
import { BrandingSettingsPage } from './pages/admin/BrandingSettingsPage';
import { RequestLogsPage } from './pages/admin/RequestLogsPage';
import { MockShipmentManagerPage } from './pages/admin/MockShipmentManagerPage';

export default function App() {
  return (
    <AppDataProvider>
      <Routes>
        <Route path="/" element={<TrackingPage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/track/:trackingNumber" element={<TrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdminAccess>
              <AppShell />
            </RequireAdminAccess>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="integration" element={<IntegrationSettingsPage />} />
          <Route path="branding" element={<BrandingSettingsPage />} />
          <Route path="logs" element={<RequestLogsPage />} />
          <Route path="mock-shipments" element={<MockShipmentManagerPage />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppDataProvider>
  );
}
