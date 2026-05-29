import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Login';
import WelcomePopup from './components/WelcomePopup';
import ErrorBoundary from './components/ErrorBoundary';
import { authService, User } from './services/authService';
import styled from 'styled-components';

// Lazy load heavy components to reduce bundle size
const BudgetCalculator = React.lazy(() => import('./components/BudgetCalculator'));
const RoomMeasurement = React.lazy(() => import('./components/RoomMeasurement'));
const Vaccination = React.lazy(() => import('./components/Vaccination'));
const ToolsOverview = React.lazy(() => import('./components/ToolsOverview'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const UserDashboard = React.lazy(() => import('./components/UserDashboard'));
const PasswordResetConfirm = React.lazy(() => import('./components/PasswordResetConfirm'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));
const NotificationAdmin = React.lazy(() => import('./components/NotificationAdmin'));
const DebugPage = React.lazy(() => import('./components/DebugPage'));

// Wrapper component to handle URL parameters
const PasswordResetConfirmWrapper: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  
  if (!uid || !token) {
    return <div>Invalid reset link</div>;
  }
  
  return <PasswordResetConfirm uid={uid} token={token} />;
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffffff;
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 18px;
  color: #666;
`;

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    } else {
      // Show welcome popup for new users (only once and only on main page)
      const hasSeenWelcomePopup = localStorage.getItem('hasSeenWelcomePopup');
      const currentPath = location.pathname;
      
      // Only show popup if:
      // 1. User hasn't seen it before
      // 2. User is on the main page (not on login/signup pages)
      // 3. User is not in the middle of a signup flow
      if (!hasSeenWelcomePopup && 
          (currentPath === '/' || currentPath === '') &&
          !currentPath.includes('/login') &&
          !currentPath.includes('/reset-password')) {
        // Delay showing the popup to let the page load first
        setTimeout(() => {
          setShowWelcomePopup(true);
        }, 2000);
      }
    }
    setLoading(false);
  }, [location.pathname]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleWelcomePopupClose = () => {
    // Store that user has seen the welcome popup
    localStorage.setItem('hasSeenWelcomePopup', 'true');
    setShowWelcomePopup(false);
  };



  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // If user is not logged in, show the main app with optional login
  if (!user) {
    return (
      <AppContainer>
        <Navigation user={user} onLogout={handleLogout} />
        <Suspense fallback={<LoadingFallback>Loading...</LoadingFallback>}>
          <Routes>
            <Route path="/" element={<ToolsOverview />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} onContinueAsGuest={() => window.history.back()} />} />
            <Route path="/reset-password/:uid/:token" element={<PasswordResetConfirmWrapper />} />
            <Route path="/vaccination" element={<Vaccination />} />
            <Route path="/measurement" element={<RoomMeasurement />} />
            <Route path="/budget-calculator" element={<BudgetCalculator />} />
            <Route path="/dev/analytics" element={<AdminDashboard />} />
            <Route path="/debug" element={<DebugPage />} />
          </Routes>
        </Suspense>
        <WelcomePopup
          open={showWelcomePopup}
          onClose={handleWelcomePopupClose}
        />
      </AppContainer>
    );
  }

  // If user is logged in, show the main app
  return (
    <AppContainer>
      <Navigation user={user} onLogout={handleLogout} />
      <Suspense fallback={<LoadingFallback>Loading...</LoadingFallback>}>
        <Routes>
          <Route path="/" element={<ToolsOverview />} />
          <Route path="/dashboard" element={<UserDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/profile" element={<UserProfile user={user} onUserUpdate={setUser} />} />
          <Route path="/vaccination" element={<Vaccination />} />
          <Route path="/measurement" element={<RoomMeasurement />} />
          <Route path="/budget-calculator" element={<BudgetCalculator />} />
          <Route path="/dev/analytics" element={<AdminDashboard />} />
          <Route path="/notifications" element={<NotificationAdmin />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </Suspense>
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
};

export default App;