import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

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

  const features = [
    {
      icon: '🎯',
      title: 'Project Assessment',
      description: 'Comprehensive evaluation of project maturity levels with detailed insights and recommendations.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Real-time dashboards with interactive charts, progress tracking, and performance metrics.'
    },
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Seamless team management with role-based access and collaborative assessment tools.'
    },
    {
      icon: '📈',
      title: 'Maturity Scoring',
      description: 'Scientific scoring algorithms based on industry standards and best practices.'
    },
    {
      icon: '🔍',
      title: 'Deep Analysis',
      description: 'Detailed category-wise analysis with strengths, weaknesses, and improvement areas.'
    },
    {
      icon: '📋',
      title: 'Smart Reports',
      description: 'Automated report generation with actionable insights and executive summaries.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager, TechCorp',
      image: '👩‍💼',
      text: 'PMAL transformed how we assess our projects. The insights are invaluable for strategic planning.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO, InnovateLab',
      image: '👨‍💻',
      text: 'The depth of analysis and ease of use make PMAL an essential tool for our development teams.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Director, GlobalTech',
      image: '👩‍🔬',
      text: 'Outstanding platform! The maturity scoring helped us identify critical improvement areas.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(129, 140, 248, 0.15), transparent 40%)`
          }}
        />
        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => (
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
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className={`relative z-50 px-6 py-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">P</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PMAL
              </h1>
              <p className="text-gray-400 text-sm">Project Management Assessment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleNavigation('/login')}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-300 relative group"
            >
              Sign In
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
            </button>
            <button
              onClick={() => handleNavigation('/register')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`relative z-40 px-6 py-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Transform
            </span>
            <br />
            <span className="text-white">Your Projects</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Unlock the full potential of your projects with advanced maturity assessment, 
            intelligent analytics, and actionable insights that drive success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={() => handleNavigation('/register')}
              className="group px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
            >
              <span className="relative z-10">Start Free Assessment</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button className="group px-12 py-4 border-2 border-gray-600 text-white text-lg font-semibold rounded-2xl hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <span className="mr-3">Watch Demo</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: '10K+', label: 'Projects Assessed' },
              { number: '500+', label: 'Companies Trust Us' },
              { number: '95%', label: 'Accuracy Rate' },
              { number: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`relative z-40 px-6 py-32 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Modern Teams</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of project management assessment with AI-powered insights and intuitive design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className={`relative z-40 px-6 py-32 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Trusted by
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-300">See what our customers say about their experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative p-8 bg-gray-800/30 backdrop-blur-lg border border-gray-700/30 rounded-2xl hover:bg-gray-800/50 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">{testimonial.image}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-blue-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>

                <div className="absolute top-6 right-6">
                  <svg className="w-8 h-8 text-blue-400/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`relative z-40 px-6 py-32 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-gray-700/50 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-white mb-6">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Project Management?</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Join thousands of teams who have revolutionized their project assessment process with PMAL.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => handleNavigation('/register')}
                  className="group px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
                >
                  <span className="relative z-10">Start Your Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <button className="px-12 py-4 border-2 border-gray-600 text-white text-lg font-semibold rounded-2xl hover:border-blue-400 hover:bg-blue-400/10 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-40 px-6 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PMAL
            </span>
          </div>
          
          <p className="text-gray-400 mb-8">
            © 2024 PMAL. All rights reserved. Transforming project management, one assessment at a time.
          </p>
          
          <div className="flex justify-center space-x-8">
            {['Privacy Policy', 'Terms of Service', 'Contact', 'Support'].map((link, index) => (
              <a
                key={index}
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300 relative group"
              >
                {link}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;