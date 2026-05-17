import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuthStore } from './store/authStore';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewOrder } from './pages/NewOrder';
import { OrderDetail } from './pages/OrderDetail';
import { Profile } from './pages/Profile';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Layout showNavigation={true}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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

          <Route path="/messages" element={
            <ProtectedRoute>
              <div className="py-20 text-center">
                <h2 className="text-xl font-bold">Mis Mensajes</h2>
                <p className="text-gray-500">El chat estará disponible cuando se acepte una propuesta.</p>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}
