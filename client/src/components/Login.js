import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { login, keycloakLogin } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNavigation = (path) => {
    console.log(`Navigate to: ${path}`);
    navigate(path);
  };

// Replace the existing handleKeycloakLogin function with this:
const handleKeycloakLogin = async () => {
  setIsLoading(true);
  try {
    // Pass isAdmin flag based on loginType
    await keycloakLogin(loginType === 'admin');
    // Navigation will be handled by AuthContext after successful login
  } catch (error) {
    console.error('Keycloak login failed:', error);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(129, 140, 248, 0.15), transparent 40%)`
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
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

        {/* Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/20 rounded-full animate-pulse" />
        <div className="absolute bottom-32 right-32 w-24 h-24 border border-purple-500/20 rounded-xl transform rotate-45 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg transform rotate-12 animate-pulse" />
      </div>

      <div className={`relative z-10 w-full max-w-md mx-auto p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300 shadow-2xl">
                <span className="text-4xl font-bold text-white">P</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-bounce" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to continue your project assessment journey</p>
        </div>

        {/* Login Type Selector */}
        <div className="mb-8">
          <div className="flex bg-gray-800/50 border border-gray-700/50 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setLoginType('user')}
              className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                loginType === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">👤</span>
                User Login
              </div>
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                loginType === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">🛡️</span>
                Admin Login
              </div>
            </button>
          </div>
        </div>

        {/* Keycloak Login Container */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300">
              <span className="text-white font-bold text-2xl">K</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Secure Authentication</h2>
            <p className="text-gray-400 text-sm">
              {loginType === 'admin' 
                ? 'Sign in with your admin credentials via Keycloak' 
                : 'Sign in with your account via Keycloak'
              }
            </p>
          </div>

          <div className="space-y-6">
            {/* Main Keycloak Login Button */}
            <button
              type="button"
              onClick={handleKeycloakLogin}
              disabled={isLoading}
              className={`w-full px-6 py-4 font-semibold rounded-xl transform transition-all duration-300 shadow-lg relative overflow-hidden ${
                loginType === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25'
              } text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-sm">🔐</span>
                  </div>
                  <span className="relative z-10">
                    {loginType === 'admin' ? 'Sign In as Admin' : 'Sign In with Keycloak'}
                  </span>
                </div>
              )}
              {!isLoading && (
                <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 ${
                  loginType === 'admin'
                    ? 'bg-gradient-to-r from-pink-600 to-red-600'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                }`} />
              )}
            </button>

            {/* Benefits Section */}
            <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Secure & Reliable
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Enterprise-grade security
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Single Sign-On (SSO)
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multi-factor authentication
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => handleNavigation('/register')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 relative group"
            >
              Create Account
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
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;