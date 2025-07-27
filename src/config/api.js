// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/api/v1/auth/signin',
  },
  PROFILE: '/api/profile',
  FORGOT_PASSWORD: {
    VERIFY_EMAIL: '/forgotPassword/verifyEmail',
    VERIFY_OTP: '/forgotPassword/verifyOtp',
    CHANGE_PASSWORD: '/forgotPassword/changePassword',
  },
  MOLD: {
    SHARED: '/api/mold/shared',
    BY_ID: (id) => `/api/mold/shared/${id}`,
  },
 PROCESS: {
    SHARED: '/api/process/shared',
    // BY_ID: (id) => `/api/process/shared/${id}`,
    FINISH: (id) => `/api/process/finish/${id}`, // ✅ CORRECTED: Remove duplicate path
  },
  MANAGER: {
    USERS: '/api/manager/users',
    ADD_USER: '/api/manager/add-user',
    UPDATE_USER: (id) => `/api/manager/update-user/${id}`,
  },
};
