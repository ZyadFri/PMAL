import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { keycloakRegister } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNavigation = (path) => {
    console.log(`Navigate to: ${path}`);
    navigate(path);
  };

  const handleKeycloakRegister = async () => {
    setIsLoading(true);
    try {
      await keycloakRegister();
      // Navigation will be handled by AuthContext after successful registration
    } catch (error) {
      console.error('Keycloak registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const userRoles = [
    { value: 'Employee', label: 'Employee', icon: '👤', description: 'Team member or individual contributor' },
    { value: 'Project Manager', label: 'Project Manager', icon: '📋', description: 'Manages projects and teams' },
    { value: 'Business Owner', label: 'Business Owner', icon: '👔', description: 'Owns business initiatives' },
    { value: 'COO', label: 'COO', icon: '🎯', description: 'Chief Operating Officer' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          >
            <div className="w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
          </div>
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-lg mx-auto p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
              <span className="text-3xl font-bold text-white">P</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">Join PMAL</h1>
          <p className="text-gray-400">Create your account to start assessing projects</p>
        </div>

        {/* Keycloak Registration Container */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-all duration-300">
              <span className="text-white font-bold text-3xl">🔐</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Secure Registration</h2>
            <p className="text-gray-400 text-sm">
              Create your account using our secure Keycloak authentication system
            </p>
          </div>

          {/* Expected Roles Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Perfect for:</h3>
            <div className="grid grid-cols-2 gap-3">
              {userRoles.map((role) => (
                <div
                  key={role.value}
                  className="p-4 border border-gray-600 rounded-xl hover:border-blue-500/50 hover:bg-gray-700/30 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{role.icon}</div>
                    <div className="text-white font-medium text-sm">{role.label}</div>
                    <div className="text-gray-400 text-xs mt-1">{role.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Registration Button */}
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleKeycloakRegister}
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Setting up your account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">+</span>
                  </div>
                  <span className="relative z-10">Create Account with Keycloak</span>
                </div>
              )}
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>

            {/* Benefits Section */}
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                What you'll get:
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complete project maturity assessments
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics and insights
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Team collaboration tools
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Automated report generation
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Enterprise-grade security
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-400 text-sm">
                  Your data is protected by enterprise-grade encryption and security protocols.
                </span>
              </div>
            </div>

            {/* Terms */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => handleNavigation('/login')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 relative group"
            >
              Sign In
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full" />
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <button
            onClick={() => handleNavigation('/')}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-300 flex items-center justify-center group"
          >
            <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;