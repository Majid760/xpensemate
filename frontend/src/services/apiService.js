import axios from 'axios';

class ApiService {
  constructor() {
    this.api = axios.create({
      headers: {
        'Authorization' : `Bearer ${localStorage.getItem('token')}`
      },
      baseURL: process.env.REACT_APP_BACKEND_URL,
      withCredentials: true,
    });

    // Request interceptor to always attach the latest token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Clear token on 401 error
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  async get(url, config = {}) {
    const res = await this.api.get(url, config);
      return res;
  }

  async post(url, data = {}, config = {}) {
    const res = await this.api.post(url, data, config);
      return res;
  }

  async put(url, data = {}, config = {}) {
    const res = await this.api.put(url, data, config);
      return res;
  }

  async patch(url, data = {}, config = {}) {
    const res = await this.api.patch(url, data, config);
      return res;
  }

  async delete(url, config = {}) {
    const res = await this.api.delete(url, config);
      return res;
  }
}

const apiService = new ApiService();
export default apiService; 