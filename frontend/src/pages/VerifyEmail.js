import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './VerifyEmail.module.css';
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
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src={logo} alt="XpenseMate Logo" />
        </div>

        {status === 'verifying' && (
          <div className={styles.content}>
            <h1 className={styles.title}>Verifying your email...</h1>
            <p className={styles.message}>Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.content}>
            <h1 className={styles.title}>Email Verified!</h1>
            <p className={styles.message}>{message}</p>
            <p className={styles.instruction}>
              You can now <Link to="/login" className={styles.link}>sign in</Link> to continue.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.content}>
            <h1 className={styles.title}>Verification Failed</h1>
            <p className={styles.message}>{error}</p>
            <p className={styles.instruction}>
              Please try again or <Link to="/login" className={styles.link}>go to login</Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 