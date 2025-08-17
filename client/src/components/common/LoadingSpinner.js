import React from 'react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...', fullScreen = true }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <div className={`${getSizeClasses()} border-4 border-gray-200 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-sm font-bold text-white">P</span>
          </div>
        </div>
      </div>

      <div className={`${getTextSize()} font-medium text-gray-600 mb-2`}>
        {message}
      </div>

      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center p-8">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center z-50">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;