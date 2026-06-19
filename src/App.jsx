import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import Sidebar from './components/Sidebar';
import PlansModal from './components/PlansModal';
import useBilling from './hooks/useBilling';
import useIsMobile from './hooks/useIsMobile';

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
    <div className="cb-app-shell">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        billing={billing}
        onLogout={handleLogout}
        onShowPlans={() => setShowPlans(true)}
      />
      <main className={`cb-main ${isMobile ? 'cb-main--mobile-spaced' : ''}`}>
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

function UnknownRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        <Route path="*" element={<UnknownRoute />} />
      </Routes>
    </AuthProvider>
  );
}
