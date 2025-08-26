import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state if available
  React.useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 'weak', color: 'red', text: 'Weak' };
    if (password.length < 8) return { strength: 'medium', color: 'yellow', text: 'Medium' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 'strong', color: 'green', text: 'Strong' };
    }
    return { strength: 'medium', color: 'yellow', text: 'Medium' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Client-side validation
    if (password !== repeatPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(buildApiUrl(`${API_ENDPOINTS.FORGOT_PASSWORD.CHANGE_PASSWORD}/${email}`), {
        password,
        repeatPassword,
      });
      setMessage(response.data);
      // Navigate to login page after successful password change
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-400 to-green-500 rounded-full opacity-5 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header with icon */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <KeyRound className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Create New Password
          </h2>
          <p className="text-gray-600 text-lg">
            Your new password must be secure and memorable
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
          {/* Security badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Password Reset</span>
            </div>
          </div>

          {/* Email display if pre-filled */}
          {email && (
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Resetting password for:</span>
                </div>
                <p className="font-semibold text-gray-800 break-all">{email}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field - only show if not pre-filled */}
            {!email && (
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
            )}

            {/* New Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="8"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                        passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                        'bg-green-500 w-full'
                      }`}
                    ></div>
                  </div>
                </div>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Repeat Password Field */}
            <div className="relative">
              <label htmlFor="repeatPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="repeatPassword"
                  type={showRepeatPassword ? 'text' : 'password'}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                  minLength="8"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                >
                  {showRepeatPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {password && repeatPassword && (
              <div className="text-sm">
                {password === repeatPassword ? (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-green-800 font-medium">Passwords match perfectly!</span>
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                    <span className="text-red-800 font-medium">Passwords do not match</span>
                  </div>
                )}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || password !== repeatPassword || password.length < 8}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  <span>Updating Password...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Update Password</span>
                </div>
              )}
            </button>
          </form>
          
          {/* Success Message */}
          {message && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fadeIn">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-sm text-green-800 font-medium">{message}</p>
              </div>
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mr-2"></div>
                <p className="text-xs text-green-600">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-shake">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm text-green-600 hover:text-green-800 font-semibold transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Security tips */}
    
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;