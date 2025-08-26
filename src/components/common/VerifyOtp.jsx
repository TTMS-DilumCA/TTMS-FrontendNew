import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, Key, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes timer
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          setResendDisabled(false);
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post(buildApiUrl(`${API_ENDPOINTS.FORGOT_PASSWORD.VERIFY_OTP}/${otp}/${email}`));
      setMessage(response.data);
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1000);
    } catch (error) {
      setError(error.response?.data || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post(buildApiUrl(`${API_ENDPOINTS.FORGOT_PASSWORD.VERIFY_EMAIL}/${email}`));
      setMessage(response.data);
      setTimeLeft(120);
      setResendDisabled(true);
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Split OTP into individual digits for display
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-5 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header with icon */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Key className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Verify OTP
          </h2>
          <p className="text-gray-600 text-lg">
            Check your email for the verification code
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
          {/* Security badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Verification</span>
            </div>
          </div>

          {/* Email info */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">OTP sent to:</span>
              </div>
              <p className="font-semibold text-gray-800 break-all">{email}</p>
            </div>
            
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Time remaining:</span>
              <div className={`px-3 py-1 rounded-full font-mono font-bold text-lg ${
                timeLeft < 30 
                  ? 'bg-red-100 text-red-600 border border-red-200' 
                  : 'bg-blue-100 text-blue-600 border border-blue-200'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            {timeLeft === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-shake">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800 font-medium">
                    OTP expired. Please request a new one.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                Enter 6-Digit Verification Code
              </label>
              
              {/* OTP Input */}
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  maxLength="6"
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 text-center text-2xl font-mono tracking-[0.5em] font-bold"
                  placeholder="000000"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center mt-3 gap-1">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index < otp.length 
                        ? 'bg-purple-500' 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || timeLeft === 0 || otp.length !== 6}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Verify Code</span>
                </div>
              )}
            </button>
          </form>
          
          {/* Resend OTP */}
          <div className="mt-6">
            <button
              onClick={handleResendOtp}
              disabled={resendDisabled || resendLoading}
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {resendLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent mr-3"></div>
                  <span>Resending...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  <span>Resend OTP</span>
                </div>
              )}
            </button>
            
            {resendDisabled && timeLeft > 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                You can resend OTP in <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </p>
            )}
          </div>
          
          {/* Success Message */}
          {message && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fadeIn">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-sm text-green-800 font-medium">{message}</p>
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
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
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

export default VerifyOtp;