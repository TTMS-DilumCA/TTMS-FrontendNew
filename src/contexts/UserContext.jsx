import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    firstname: '',
    lastname: '',
    fullname: '',
    email: '',
    role: '',
    profileImageUrl: '',
    loading: true,
    error: null
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const fetchUserProfile = async (forceRefresh = false) => {
    // Don't fetch if already loaded and not forcing refresh
    if (isInitialized && !forceRefresh) {
      return userInfo;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setUserInfo(prev => ({ ...prev, loading: false, error: 'No token found' }));
        return;
      }

      setUserInfo(prev => ({ ...prev, loading: true, error: null }));

      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = {
        firstname: response.data.firstname || '',
        lastname: response.data.lastname || '',
        fullname: response.data.fullname || '',
        email: response.data.email || '',
        role: response.data.role || '',
        profileImageUrl: response.data.profileImageUrl || '',
        loading: false,
        error: null
      };

      setUserInfo(userData);
      setIsInitialized(true);
      
      // Cache the user data in localStorage for quick access
      localStorage.setItem('userProfile', JSON.stringify({
        ...userData,
        timestamp: Date.now()
      }));
      
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // If token is invalid, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        window.location.href = '/login';
        return;
      }

      setUserInfo(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to fetch user profile' 
      }));
    }
  };

  const updateUserProfile = (updatedData) => {
    setUserInfo(prev => ({ ...prev, ...updatedData }));
  };
  const clearUserData = () => {
    setUserInfo({
      firstname: '',
      lastname: '',
      fullname: '',
      email: '',
      role: '',
      profileImageUrl: '',
      loading: false,
      error: null
    });
    setIsInitialized(false);
    localStorage.removeItem('userProfile');
  };

  // Helper functions
  const getUserInitials = () => {
    if (userInfo.loading) return '...';
    const firstInitial = userInfo.firstname?.charAt(0)?.toUpperCase() || '';
    const lastInitial = userInfo.lastname?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || 'U';
  };

  const getFullName = () => {
    if (userInfo.loading) return 'Loading...';
    return userInfo.fullname || `${userInfo.firstname} ${userInfo.lastname}`.trim() || 'User';
  };

  const getRoleDisplayName = (role = userInfo.role) => {
    switch (role) {
      case 'ROLE_MANAGER':
        return 'Manager';
      case 'ROLE_MACHINE_OPERATOR_01':
        return 'Machine Operator 1';
      case 'ROLE_MACHINE_OPERATOR_02':
        return 'Machine Operator 2';
      default:
        return 'User';
    }
  };
  // Initial fetch on mount
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserInfo(prev => ({ ...prev, loading: false, error: 'No token found' }));
        return;
      }

      // Try to load from localStorage cache first
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          const cacheAge = Date.now() - (parsedProfile.timestamp || 0);
          
          // Use cache if it's less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            const { timestamp, ...userData } = parsedProfile;
            setUserInfo({ ...userData, loading: false });
            setIsInitialized(true);
            return;
          }
        } catch (error) {
          console.error('Error parsing cached profile:', error);
          localStorage.removeItem('userProfile');
        }
      }

      // If no valid cache, fetch from API
      await fetchUserProfile(true);
    };

    if (!isInitialized) {
      initializeUser();
    }
  }, [isInitialized]);

  const value = {
    userInfo,
    fetchUserProfile,
    updateUserProfile,
    clearUserData,
    getUserInitials,
    getFullName,
    getRoleDisplayName,
    isInitialized
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
