import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import keycloak from './config/keycloak';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Loading component
const LoadingComponent = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px'
  }}>
    Loading PMAL...
  </div>
);

// Error component (removed to fix ESLint warning)

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = keycloak.authenticated;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = keycloak.authenticated;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ReactKeycloakProvider 
      authClient={keycloak}
      LoadingComponent={LoadingComponent}
      initOptions={{
        onLoad: 'check-sso',
        checkLoginIframe: false, // Disable iframe check
        enableLogging: true
      }}
      onError={(error) => {
        console.error('Keycloak error:', error);
      }}
    >
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ReactKeycloakProvider>
  );
}

export default App;