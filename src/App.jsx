import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import Sidebar from './components/Sidebar';
import PlansModal from './components/PlansModal';
import useBilling from './hooks/useBilling';
import useIsMobile from './hooks/useIsMobile';

const C = { bg: "#0F0D08", text: "#F5ECD7" };

function AppLayout() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showPlans, setShowPlans] = useState(false);
  const { billing, checkout: handleCheckout } = useBilling();
  const isMobile = useIsMobile();

  const handleLogout = () => logout();

  const renderView = () => {
    if (currentView === 'profile') return <ProfilePage onLogout={handleLogout} onShowPlans={() => setShowPlans(true)} />;
    if (currentView === 'feedback') return <FeedbackPage />;
    return <DashboardPage onShowPlans={() => setShowPlans(true)} />;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        billing={billing}
        onLogout={handleLogout}
        onShowPlans={() => setShowPlans(true)}
      />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: isMobile ? 50 : 0,
        paddingBottom: isMobile ? 64 : 0,
        minWidth: 0,
      }}>
        {renderView()}
      </main>
      <PlansModal
        open={showPlans}
        onClose={() => setShowPlans(false)}
        onCheckout={handleCheckout}
        currentPlan={billing?.plan}
      />
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
