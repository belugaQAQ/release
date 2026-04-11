import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { KeyAuthProvider, useKeyAuth } from './hooks/useKeyAuth';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { HomePage } from './pages/HomePage';
import { EditPage } from './pages/EditPage';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import './styles/global.css';

function AppContent() {
  const { isAuthenticated } = useKeyAuth();

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
