import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BudgetCalculator from './components/BudgetCalculator';
import RoomMeasurement from './components/RoomMeasurement';
import Navigation from './components/Navigation';
import Vaccination from "./components/Vaccination";
import ToolsOverview from './components/ToolsOverview';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsDebug from './components/AnalyticsDebug';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import WelcomePopup from './components/WelcomePopup';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import UserProfile from './components/UserProfile';
import NotificationAdmin from './components/NotificationAdmin';
import { authService, User } from './services/authService';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

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
      
      console.log('Current path:', currentPath); // Debug log
      console.log('Has seen popup:', hasSeenWelcomePopup); // Debug log
      
      // TEMPORARY: For testing, you can uncomment the next line to always show popup
      localStorage.removeItem('hasSeenWelcomePopup');
      
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
          console.log('Setting showWelcomePopup to true'); // Debug log
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
        <Routes>
          <Route path="/" element={<ToolsOverview />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} onContinueAsGuest={() => window.history.back()} />} />
          <Route path="/reset-password/:uid/:token" element={<PasswordResetConfirmWrapper />} />
          <Route path="/vaccination" element={<Vaccination />} />
          <Route path="/measurement" element={<RoomMeasurement />} />
          <Route path="/budget-calculator" element={<BudgetCalculator />} />
          <Route path="/dev/analytics" element={<AdminDashboard />} />
          <Route path="/debug" element={<AnalyticsDebug />} />
        </Routes>
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
      <Routes>
        <Route path="/" element={<ToolsOverview />} />
        <Route path="/dashboard" element={<UserDashboard user={user} onLogout={handleLogout} />} />
        <Route path="/profile" element={<UserProfile user={user} onUserUpdate={setUser} />} />
        <Route path="/vaccination" element={<Vaccination />} />
        <Route path="/measurement" element={<RoomMeasurement />} />
        <Route path="/budget-calculator" element={<BudgetCalculator />} />
        <Route path="/dev/analytics" element={<AdminDashboard />} />
        <Route path="/notifications" element={<NotificationAdmin />} />
        <Route path="/debug" element={<AnalyticsDebug />} />
      </Routes>
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;