import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Settings, Users } from 'lucide-react';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the input fields are autofilled and update the state
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput && emailInput.value) {
      setEmail(emailInput.value);
    }
    if (passwordInput && passwordInput.value) {
      setPassword(passwordInput.value);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(buildApiUrl(API_ENDPOINTS.AUTH.SIGNIN), { email, password });
      const { token, refreshToken } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      const userRole = JSON.parse(atob(token.split('.')[1])).role;
      if (userRole === 'ROLE_MANAGER') {
        window.location.href = '/manager';
      } else if (userRole === 'ROLE_MACHINE_OPERATOR_01') {
        window.location.href = '/operator1';
      } else if (userRole === 'ROLE_MACHINE_OPERATOR_02') {
        window.location.href = '/operator2';
      }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex relative overflow-hidden">
      {/* Background decorative elements - now applied to the entire page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Modern circular gradients */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-tl from-indigo-300/20 to-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-teal-300/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        {/* Animated floating shapes - subtle motion */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tl from-blue-400/10 to-cyan-500/10 rounded-full animate-float-medium"></div>
      </div>


   {/* Left side - Brand section with background */}
<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
  {/* Main background image with filters to enhance visibility */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter contrast-125 brightness-75 saturate-150"
    style={{ backgroundImage: 'url(/loginimg.jpeg)' }}
  />
  
  {/* Semi-transparent gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-indigo-800/50 mix-blend-multiply"></div>
  
  {/* Content with glass panel for better readability - centered positioning */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
      <div className="flex items-center justify-center mb-6">
        <Settings className="w-12 h-12 mr-3 text-white" />
        <h1 className="text-3xl font-bold text-white">TTMS</h1>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-white text-center">Tool Time Management System</h2>
      <p className="text-white/90 text-lg leading-relaxed text-center">
        Streamline your operations with our comprehensive management platform designed for efficiency, precision, and scalability.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center bg-white/5 p-4 rounded-lg border border-white/10">
          <Users className="w-7 h-7 mx-auto mb-2 text-blue-200" />
          <p className="text-sm text-white/80">Team Management</p>
        </div>
        <div className="text-center bg-white/5 p-4 rounded-lg border border-white/10">
          <Settings className="w-7 h-7 mx-auto mb-2 text-blue-200" />
          <p className="text-sm text-white/80">Process Control</p>
        </div>
      </div>
    </div>
  </div>
</div>
        
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="w-full max-w-md relative z-10">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Settings className="w-10 h-10 mr-3 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">TTMS</h1>
            </div>
            <p className="text-gray-600">Tool Time Management System</p>
          </div>

          {/* Updated form container with glassmorphism effect */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-blue-700 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">Welcome back</h2>
              <p className="text-gray-600">Please sign in to your account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:via-blue-700 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 transform hover:translate-y-[-2px]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Add animation keyframes for floating elements */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;