import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { KeyAuthProvider, useKeyAuth } from './hooks/useKeyAuth';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { HomePage } from './pages/HomePage';
import { EditPage } from './pages/EditPage';
import { EchoSubmitPage } from './pages/EchoSubmitPage';
import { EchoAdminPage } from './pages/EchoAdminPage';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import './styles/global.css';

function AppContent() {
  const { isAuthenticated } = useKeyAuth();
  const location = useLocation();

  // 投稿页面不需要认证，也没有导航栏
  if (location.pathname === '/echo-submit') {
    return (
      <Routes>
        <Route path="/echo-submit" element={<EchoSubmitPage />} />
        <Route path="*" element={<Navigate to="/echo-submit" replace />} />
      </Routes>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthenticationPage />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/echo-admin" element={<EchoAdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <KeyAuthProvider>
        <AppContent />
      </KeyAuthProvider>
    </Router>
  );
}

export default App;
