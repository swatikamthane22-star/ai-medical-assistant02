import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Checker from './pages/Checker.jsx';
import Hospitals from './pages/Hospitals.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function Private({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="wrap">
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/" element={<Private><Home /></Private>} />
          <Route path="/admin" element={<Private adminOnly><AdminDashboard /></Private>} />
          <Route path="/check" element={<Private><Checker /></Private>} />
          <Route path="/hospitals" element={<Private><Hospitals /></Private>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="foot">For information only. Not a medical diagnosis. In an emergency, call your local emergency number (India: 108 / 112).</footer>
    </>
  );
}
