import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppBar } from './components/Layout/AppBar';
import { Navigation } from './components/Layout/Navigation';
import { HomePage } from './pages/HomePage';
import { EditPage } from './pages/EditPage';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import './styles/global.css';

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar />
      
      <main style={{ flex: 1, paddingBottom: '80px' }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <Navigation />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
