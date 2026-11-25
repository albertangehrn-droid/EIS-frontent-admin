import useGameStore from '@/stores/useGameStore';

// Helper to extract clean error message from backend response
const getCleanErrorMessage = (errorData) => {
  if (!errorData) return 'Something went wrong';
  
  // If message contains stack trace (has "at " or file paths), extract only first line
  if (errorData.message) {
    const message = errorData.message;
    const firstLine = message.split('\n')[0];
    // Check if it looks like a stack trace
    if (message.includes('at ') || message.includes('.js:')) {
      return firstLine.trim();
    }
    return message;
  }
  
  if (errorData.error) {
    const error = errorData.error;
    const firstLine = error.split('\n')[0];
    if (error.includes('at ') || error.includes('.js:')) {
      return firstLine.trim();
    }
    return error;
  }
  
  return 'Something went wrong';
};

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    
    switch (status) {
      case 401: {
        // Unauthorized - only redirect if not on login page (session expiry)
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : '/EIS/admin';
        const cleanBase = (basePath || '').replace(/\/$/, '');
        const loginPath = cleanBase || '/EIS/admin';
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isLoginPage =
          currentPath === loginPath ||
          currentPath === `${loginPath}/` ||
          currentPath === '/' ||
          currentPath === '/admin' ||
          currentPath === '/admin/';

        if (!isLoginPage) {
          const logout = useGameStore.getState().logout;
          if (logout) logout();
          // Delay redirect to show error message
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = loginPath;
            }
          }, 2000);
          return 'Session expired. Please login again.';
        }
        // On login page, just return the error message (login failure)
        return getCleanErrorMessage(error.response.data) || 'Invalid credentials. Please try again.';
      }
      
      case 403:
        return 'Access denied. You don\'t have permission.';
      
      case 404:
        return 'Resource not found. Please try again.';
      
      case 400:
        return getCleanErrorMessage(error.response.data) || 'Invalid request. Please check your input.';
      
      case 500:
        return 'Server error. Please try again later.';
      
      default:
        return getCleanErrorMessage(error.response.data) || 'Something went wrong';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Error in request setup
    return 'Request failed. Please try again.';
  }
};
