import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import JobDiscovery from './pages/JobDiscovery';
import WorkerDashboard from './pages/Dashboards/WorkerDashboard';
import ProviderDashboard from './pages/Dashboards/ProviderDashboard';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';

// ScrollToTop Helper integration for Router
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        
        <div className="page-wrapper">
          <Header />
          <main className="main-content container">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Auth type="login" />} />
              <Route path="/register" element={<Auth type="register" />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/jobs" element={<JobDiscovery />} />
              <Route path="/dashboard/worker" element={<WorkerDashboard />} />
              <Route path="/dashboard/provider" element={<ProviderDashboard />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
