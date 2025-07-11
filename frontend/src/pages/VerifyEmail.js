import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logo.png';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        if (err.response?.data?.message === 'Email already verified') {
          setStatus('success');
          setMessage('Your email is already verified.');
        } else {
          setStatus('error');
          setError(err.response?.data?.message || 'Email verification failed');
        }
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white relative overflow-hidden font-sans">
      {/* Background image overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[871px] h-[733px] bg-no-repeat bg-contain bg-center pointer-events-none z-0" style={{ backgroundImage: "url('/images/signin-background.png')" }} />
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 w-full max-w-md mx-auto px-6 py-12 sm:px-8 sm:py-16 overflow-hidden animate-fadeIn -mt-16 z-10">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        {/* Logo */}
        <div className="flex justify-center items-center gap-3 mb-12 mt-2">
          <img src={logo} alt="XpenseMate Logo" className="w-48 h-16 object-contain" />
        </div>
        {/* Content */}
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 tracking-tight">Verifying your email...</h1>
              <div className="flex justify-center items-center mb-4">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 text-base">Please wait while we verify your email address.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-4 tracking-tight">Email Verified!</h1>
              <p className="text-slate-700 text-base mb-2">{message}</p>
              <p className="text-slate-500 text-base">
                You can now{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline transition-colors">sign in</Link>{' '}
                to continue.
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-red-600 mb-4 tracking-tight">Verification Failed</h1>
              <p className="text-slate-700 text-base mb-2">{error}</p>
              <p className="text-slate-500 text-base">
                Please try again or{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline transition-colors">go to login</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 