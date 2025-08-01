import React from 'react';

const NotFound = () => {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-6">
      <div className="max-w-lg mx-auto text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text animate-pulse">
            404
          </div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Don't worry, let's get you back on track!
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
            <span className="text-6xl">🔍</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>🏠</span>
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={handleGoBack}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>←</span>
            <span>Go Back</span>
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Need help? Try these:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/projects" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              📁 My Projects
            </a>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              📊 Dashboard
            </a>
            <a href="/reports" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              📋 Reports
            </a>
            <a href="/profile" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              ⚙️ Settings
            </a>
          </div>
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

export default NotFound;