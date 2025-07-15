import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, keycloak, initialized } = useAuth();

  // Show loading while Keycloak is initializing or auth is loading
  if (isLoading || !initialized) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if Keycloak user is properly authenticated and enabled
  if (keycloak && keycloak.authenticated) {
    // If we have a Keycloak session, the user is activated by definition
    // (Keycloak wouldn't let them login if they weren't enabled)
    return children;
  }

  // For non-Keycloak users (if you support both), check the old way
  if (user && user.isActivated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Activation</h2>
          <p className="text-gray-600 mb-6">
            Your account is awaiting admin approval. You'll receive an email notification once your account is activated.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // If we reach here and have authentication, allow access
  return children;
};

export default ProtectedRoute;