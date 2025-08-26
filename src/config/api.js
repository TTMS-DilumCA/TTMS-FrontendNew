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
    UPDATE: (id) => `/api/mold/shared/${id}`,        
    DELETE: (id) => `/api/mold/shared/${id}`,        
    BY_YEAR: (year) => `/api/mold/year/${year}`,     
    COMPLETE: (id) => `/api/mold/${id}/complete`,
    ANALYTICS: (year) => `/api/mold/analytics/${year}`,
    
  },
 PROCESS: {
    SHARED: '/api/process/shared',
    // BY_ID: (id) => `/api/process/shared/${id}`,
    FINISH: (id) => `/api/process/finish/${id}`, 
    DETAILS: (id) => `/api/process/details/${id}`,//details by id
  },
  MANAGER: {
    USERS: '/api/manager/users',
    ADD_USER: '/api/manager/add-user',
    UPDATE_USER: (id) => `/api/manager/update-user/${id}`,
    DELETE_USER: (id) => `/api/manager/delete-user/${id}`,
  },
    CUSTOMERS: {
    LIST: '/api/customers',                    
    BY_ID: (id) => `/api/customers/${id}`,     
    UPDATE: (id) => `/api/customers/${id}`,   
    DELETE: (id) => `/api/customers/${id}`,    
  },
    TOOLS: {
    LIST: '/api/tools',
    CREATE: '/api/tools',
    BY_ID: (id) => `/api/tools/${id}`,
    UPDATE: (id) => `/api/tools/${id}`,
    DELETE: (id) => `/api/tools/${id}`,
    BY_CRAFTER: (crafterId) => `/api/tools/crafter/${crafterId}`,
    WITH_CRAFTER_DETAILS: '/api/tools/with-crafter-details',
    ACKNOWLEDGE: (id) => `/api/tools/${id}/acknowledge`,
  },
    SYSTEM_OVERVIEW: {
    MOLDS: (timeRange) => `/api/system-overview/molds?timeRange=${timeRange}`,
    CUSTOMERS: (timeRange) => `/api/system-overview/customers?timeRange=${timeRange}`,
    PROCESSES: (timeRange) => `/api/system-overview/processes?timeRange=${timeRange}`,
    TOOLS: (timeRange) => `/api/system-overview/tools?timeRange=${timeRange}`,
    WORKFORCE: (timeRange) => `/api/system-overview/workforce?timeRange=${timeRange}`,
  },
 
};
