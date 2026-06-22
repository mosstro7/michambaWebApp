import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { Role } from './types';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewOrder } from './pages/NewOrder';
import { OrderDetail } from './pages/OrderDetail';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { AdminReports } from './pages/AdminReports';
import { ContactArea } from './pages/ContactArea';
import { MyJobs } from './pages/MyJobs';
import { Chat } from './pages/Chat';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  const homeElement = !isAuthenticated
    ? <Landing />
    : user?.rol === Role.ADMIN
    ? <Navigate to="/admin" replace />
    : <Dashboard />;

  return (
    <Router>
      <Layout showNavigation={true}>
        <Routes>
          <Route path="/" element={homeElement} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin" element={
            <ProtectedRoute role={Role.ADMIN}>
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute role={Role.ADMIN}>
              <AdminReports />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/new-order" element={
            <ProtectedRoute>
              <NewOrder />
            </ProtectedRoute>
          } />

          <Route path="/order/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/feed" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/my-orders" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/contact" element={
            <ProtectedRoute role={Role.CLIENTE}>
              <ContactArea />
            </ProtectedRoute>
          } />

          <Route path="/my-jobs" element={
            <ProtectedRoute role={Role.ESPECIALISTA}>
              <MyJobs />
            </ProtectedRoute>
          } />

          <Route path="/chats/:id" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}
