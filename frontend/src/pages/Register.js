import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Toast from '../components/Toast';
import styles from './Register.module.css';
import logo from '../images/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 6 characters long';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate password
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password
      });

      setSuccess('Registration successful! Please check your email for verification.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 w-full max-w-md mx-auto px-6 py-18 sm:px-8 sm:py-20 font-sans overflow-hidden animate-fadeIn -mt-16"
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
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-8 tracking-tight">Create account</h1>
        {/* Input Fields */}
        <div className="space-y-4 mb-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <InputField
              label="First name"
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              activeBorderColor="#4f46e5"
            />
            <InputField
              label="Last name"
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              activeBorderColor="#4f46e5"
            />
          </div>
          <InputField
            label="Enter a valid email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            activeBorderColor="#4f46e5"
          />
          <InputField
            label="Create a secure password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            hint="Password must be at least 6 characters and contain one special character"
            activeBorderColor="#4f46e5"
          />
          <InputField
            label="Re-enter your password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
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
              <span className="opacity-0"> {'Creating Account...'} </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            'Create Account'
          )}
        </button>
        {/* Register Link */}
        <div className="text-center mt-6 text-slate-600 text-base">
          Already have an account?
          <Link to="/login" className="text-indigo-500 font-semibold hover:underline ml-2 transition-colors">Log in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register; 