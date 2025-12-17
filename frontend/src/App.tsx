import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { RequireAuth } from './components/routes/RequireAuth';
import { RequireRole } from './components/routes/RequireRole';
import { AppLayout } from './components/layout/AppLayout';
import { UserRole } from './types';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';

// Shared Pages
import { DashboardRedirect } from './pages/DashboardRedirect';
import { Profile } from './pages/Profile';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { DoctorsList } from './pages/patient/DoctorsList';
import { AppointmentsList } from './pages/patient/AppointmentsList';
import { BookAppointment } from './pages/patient/BookAppointment';
import { AppointmentDetail } from './pages/patient/AppointmentDetail';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { Schedule } from './pages/doctor/Schedule';
import { DoctorAppointmentDetail } from './pages/doctor/AppointmentDetail';
import { MedicalRecords } from './pages/doctor/MedicalRecords';

import './index.css';

const GOOGLE_CLIENT_ID = '1046818974387-g50q8vuup1bip7pnh8acctl7kdljtcci.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* Protected Routes - All Authenticated */}
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppLayout>
                    <DashboardRedirect />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/profile"
              element={
                <RequireAuth>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/unauthorized"
              element={
                <RequireAuth>
                  <AppLayout>
                    <Unauthorized />
                  </AppLayout>
                </RequireAuth>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/app/patient/dashboard"
              element={
                <RequireRole allowedRoles={[UserRole.PATIENT]}>
                  <AppLayout>
                    <PatientDashboard />
                  </AppLayout>
                </RequireRole>
              }
            />
            <Route
              path="/app/patient/doctors"
              element={
                <RequireRole allowedRoles={[UserRole.PATIENT]}>
                  <AppLayout>
                    <DoctorsList />
                  </AppLayout>
                </RequireRole>
              }
            />
            <Route
              path="/app/patient/appointments"
              element={
                <RequireRole allowedRoles={[UserRole.PATIENT]}>
                  <AppLayout>
                    <AppointmentsList />
                  </AppLayout>
                </RequireRole>
              }
            />
            <Route
              path="/app/patient/appointments/new"
              element={
                <RequireRole allowedRoles={[UserRole.PATIENT]}>
                  <AppLayout>
                    <BookAppointment />
                  </AppLayout>
                </RequireRole>
              }
            />
            <Route
              path="/app/patient/appointments/:id"
              element={
                <RequireRole allowedRoles={[UserRole.PATIENT]}>
                  <AppLayout>
                    <AppointmentDetail />
                  </AppLayout>
                </RequireRole>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/app/doctor/dashboard"
              element={
                <RequireRole allowedRoles={[UserRole.DOCTOR]}>
                  <AppLayout>
                    <DoctorDashboard />
                  </AppLayout>
                </RequireRole>
              }
            />
            <Route
              path="/app/doctor/schedule"
              element={
                <RequireRole allowedRoles={[UserRole.DOCTOR]}>
                  <AppLayout>
                    <Schedule />
                  </AppLayout>
                </RequireRole>
              }
            />
            <Route
              path="/app/doctor/appointments/:id"
              element={
                <RequireRole allowedRoles={[UserRole.DOCTOR]}>
                  <AppLayout>
                    <DoctorAppointmentDetail />
                  </AppLayout>
                </RequireRole>
              }
            />
            <Route
              path="/app/doctor/records"
              element={
                <RequireRole allowedRoles={[UserRole.DOCTOR]}>
                  <AppLayout>
                    <MedicalRecords />
                  </AppLayout>
                </RequireRole>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
