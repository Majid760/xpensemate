import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../components/InputField';
import Checkbox from '../components/Checkbox';
import Toast from '../components/Toast';
import styles from './Login.module.css';
import logo from '../images/logo.png';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import Cookies from 'js-cookie';

const Login = () => {
  // const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
    
      // Send the Google credential to  backend
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/google-oauth`,
        {
          credential: credentialResponse.credential
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      // Check if the response is successful
      if (response.data.type === 'success' && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        Cookies.set('token', response.data.token, {
          expires: 1,   
          sameSite: 'Strict', 
        });
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Force a page reload to ensure AuthContext picks up the new token
        navigate('/dashboard');
      } else {
        setError('Google sign-in failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google sign-in failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
        email: form.email,
        password: form.password,
        rememberMe: remember
      });

      console.log('Login response:', res.data);

      // Store the token in localStorage
      const { token, refreshToken } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      Cookies.set('token', token, {
        expires: 7,   
        sameSite: 'Strict', 
      });
      // Set the Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Force a page reload to ensure AuthContext picks up the new token
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.needsVerification) {
        setSuccess(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.background + " min-h-screen flex items-center justify-center p-4"}>
      {/* Toasts */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError('')}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess('')}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
        />
      )}
      <form
        className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 w-full max-w-md mx-auto px-6 py-12 sm:px-8 sm:py-16 font-sans overflow-hidden animate-fadeIn -mt-16"
        onSubmit={handleSubmit}
        style={{ zIndex: 2 }}
      >
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        {/* Logo */}
        <div className="flex justify-center items-center gap-3 mb-12 mt-2">
          <img src={logo} alt="XpenseMate Logo" className="w-48 h-16 object-contain" />
        </div>
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-8 tracking-tight">Login</h1>
        {/* Input Fields */}
        <div className="space-y-4 mb-2">
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            activeBorderColor="#4f46e5"
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            activeBorderColor="#4f46e5"
          />
        </div>
        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full my-4 relative px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all duration-200 font-bold active:scale-95 shadow-lg shadow-indigo-500/20 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="opacity-0"> {'Logging in...'}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            'Log in'
          )}
        </button>
        {/* <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 active:scale-95 transition-all duration-200">
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button> */}
        {/* Keep me logged in & Forgot Password */}
        <div className="flex justify-between items-center mt-2 mb-2 text-sm">
          <Checkbox
            label="Keep me logged in"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          />
          <Link className="text-indigo-500 font-semibold hover:underline transition-colors" to="/forgot-password">Forgot Password?</Link>
        </div>
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="mx-4 text-slate-400 font-semibold text-sm animate-fadeIn">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        {/* Google Login */}
        <div className="flex flex-col items-center mb-2">
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google sign-in failed')}
              useOneTap
              theme="filled_blue"
              size="large"
              width="100%"
            />
          </GoogleOAuthProvider>
        </div>
        {/* Register Link */}
        <div className="text-center mt-6 text-slate-600 text-base">
          Don't have an account?
          <Link className="text-indigo-500 font-semibold hover:underline ml-2 transition-colors" to="/register">Create an account</Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 