import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';
import BudgetGoalsPage from './pages/BudgetGoalsPage';
import ExpensesPage from './pages/ExpensesPage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import { AuthProvider } from './contexts/AuthContext';
import Privacy from './pages/Privacy';
import TermsAndConditions from './pages/TermsAndConditions';
import About from './pages/About';
import { BudgetGoalsProvider } from './contexts/BudgetGoalsContext';
import { WalletProvider } from './contexts/WalletContext';


function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarExpanded(true);
      else setSidebarExpanded(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AuthProvider>
      <BudgetGoalsProvider>
        <WalletProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } />
            <Route path="/register" element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            } />
            <Route path="/forgot-password" element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            } />
            <Route path="/reset-password/:token" element={
              <AuthRoute>
                <ResetPassword />
              </AuthRoute>
            } />
            <Route path="/verify-email/:token" element={
              <AuthRoute>
                <VerifyEmail />
              </AuthRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
              </ProtectedRoute>
            } />
            <Route path="/budget-goals" element={
              <ProtectedRoute>
                <BudgetGoalsPage expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <ExpensesPage expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <PaymentsPage expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <SupportPage expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
              </ProtectedRoute>
            } />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms&conditions" element={<TermsAndConditions />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </WalletProvider>
      </BudgetGoalsProvider>
    </AuthProvider>
  );
}

export default App; 