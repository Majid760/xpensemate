import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL; // Use env variable or fallback

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add response interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Only handle 401 errors, not network errors or other issues
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        return new Promise(function(resolve, reject) {
          axios
            .post('/auth/refresh-token', { token: refreshToken })
            .then(({ data }) => {
              const accessToken = data?.data?.token ?? data?.token;
              if (!accessToken) {
                throw new Error('AuthContext: Refresh response missing accessToken');
              }
              localStorage.setItem('token', accessToken);
              Cookies.set('token', accessToken, {
                expires: 1,   
                sameSite: 'Strict', 
              });
              console.log(`Refresh>>>>>>>>> ${accessToken}`)
      
              axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
              originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
              processQueue(null, accessToken);
              resolve(axios(originalRequest));
            })
            .catch(err => {
              processQueue(err, null);
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              delete axios.defaults.headers.common['Authorization'];
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const updateUser = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData
    }));
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  // Manual token validation function for debugging
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    console.log('Manual token validation:', {
      tokenExists: !!token,
      tokenLength: token?.length,
      currentPath: window.location.pathname
    });
    
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/user/me');
        console.log('Token validation successful:', response.data.data);
        return true;
      } catch (error) {
        console.error('Token validation failed:', error.response?.status, error.response?.data.data);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    // Add event listener to track localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        console.log('AuthContext: Token changed in localStorage:', {
          oldValue: e.oldValue ? 'exists' : 'null',
          newValue: e.newValue ? 'exists' : 'null',
          url: window.location.href
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('AuthContext: Initializing with token:', token ? 'exists' : 'none');
        
        if (token) {
        
          // Set default authorization header with the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Fetch user data
            const response = await axios.get('/user/me');
            const responseData = response?.data?.data;
            const extractedUser = responseData?.user ?? responseData?.data?.user ?? null;
            if (extractedUser) {
              setUser(extractedUser);
              console.log('AuthContext: User set successfully');
            } else {
              console.error('AuthContext: Invalid response format:', responseData);
              // Don't clear token for invalid response format, just set user to null
              setUser(null);
            }
          } catch (apiError) {
            console.error('AuthContext: API call failed:', apiError);
            console.error('AuthContext: Error details:', {
              status: apiError.response?.status,
              statusText: apiError.response?.statusText,
              data: apiError.response?.data,
              message: apiError.message
            });
            
            // Only clear token for 401 errors
            if (apiError.response && apiError.response.status === 401) {
              console.log('AuthContext: 401 error, clearing token and redirecting');
              localStorage.removeItem('token');
              delete axios.defaults.headers.common['Authorization'];
              setUser(null);
              // Only redirect if we're not already on the login page
              if (window.location.pathname !== '/login') {
                navigate('/login');
              }
            } else {
              // For other errors (network, server down, etc.), keep the token but set user to null
              console.log('AuthContext: Non-401 error, keeping token but clearing user');
              setUser(null);
            }
          }
        } else {
          console.log('AuthContext: No token found, clearing user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Initialization failed:', error);
        // Don't clear token for initialization errors, just set user to null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Expose validateToken for debugging
  useEffect(() => {
    window.validateToken = validateToken;
    return () => {
      delete window.validateToken;
    };
  }, []);

  const value = {
    user,
    setUser,
    loading,
    updateUser,
    logout,
    validateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 