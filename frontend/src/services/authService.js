import axios from 'axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return user;
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return user;
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

export const updateUser = async (userData) => {
  try {
    const response = await axios.put('/auth/profile', userData);
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update user';
  }
}; 