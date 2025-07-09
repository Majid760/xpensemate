import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../components/InputField';
import Toast from '../components/Toast';
import styles from './ForgotPassword.module.css';
import logo from '../images/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/forgot-password`, { email });
      setSuccess('Password reset instructions have been sent to your email');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
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
        <div className="flex justify-center mb-8 mt-2">
          <img src={logo} alt="XpenseMate Logo" className="w-48 h-16 object-contain" />
        </div>
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-4 tracking-tight">Forgot Password</h1>
        <p className="text-slate-500 text-center text-base sm:text-lg mb-8 max-w-md mx-auto">Enter your email and we'll send you a link to reset your password.</p>
        {/* Input Field */}
        <div className="mb-6">
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              <span className="opacity-0"> {'Sending...'} </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            'Submit'
          )}
        </button>
        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <Link className="text-slate-500 hover:text-indigo-500 font-semibold flex items-center justify-center gap-2 transition-colors" to="/login">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Login
        </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword; 