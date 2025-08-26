import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';
import logo from '../../assets/logo.png';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';


const NavBarOperator2 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ 
    firstname: '', 
    lastname: '', 
    email: '', 
    role: 'ROLE_MACHINE_OPERATOR_02',
    loading: true 
  });
  const location = useLocation();

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

const response = await axios.get(buildApiUrl(API_ENDPOINTS.PROFILE), {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setUserInfo({
          firstname: response.data.firstname || '',
          lastname: response.data.lastname || '',
          email: response.data.email || '',
          role: response.data.role || 'ROLE_MACHINE_OPERATOR_02',
          loading: false
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        setUserInfo(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUserProfile();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    { to: '/operator2', label: 'Home' },
    { to: '/operator-tasks', label: 'Machine Processes' },
    { to: '/profile-operator2', label: 'Profile' },
  ];

  // Helper function to get user initials
  const getUserInitials = () => {
    if (userInfo.loading) return '...';
    const firstInitial = userInfo.firstname?.charAt(0)?.toUpperCase() || '';
    const lastInitial = userInfo.lastname?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || 'U';
  };

  // Helper function to get full name
  const getFullName = () => {
    if (userInfo.loading) return 'Loading...';
    return `${userInfo.firstname} ${userInfo.lastname}`.trim() || 'User';
  };

  // Helper function to get role display name
  const getRoleDisplayName = () => {
    return 'Machine Operator 2';
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Company Logo" className="h-10 w-49 rounded-lg object-contain" />
              <div className="hidden sm:flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  TTMS
                </span>
              </div>
            </div>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isActiveLink(item.to)
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {isActiveLink(item.to) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative user-menu-container">
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-slate-800 via-blue-700 to-indigo-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-700">{getFullName()}</div>
                  <div className="text-xs text-gray-500">{getRoleDisplayName()}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-800 via-blue-700 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{getFullName()}</div>
                        <div 
                          className="text-sm text-gray-500 truncate" 
                          title={userInfo.email}
                        >
                          {userInfo.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/profile-operator2"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={handleMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveLink(item.to)
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBarOperator2;