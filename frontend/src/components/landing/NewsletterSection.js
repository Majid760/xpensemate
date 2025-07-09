import React, { useState } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import { useTranslation } from 'react-i18next';

export default function NewsletterSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('Please enter a valid email address.');
      setTimeout(() => setError(''), 3500);
      return;
    }
    try {
      await apiService.post('/subscribe-newsletter', { email });
      setSuccess('Thank you for subscribing!');
      setSubmitted(true);
      setEmail('');
      setTimeout(() => {
        setSubmitted(false);
        setSuccess('');
      }, 3500);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This email is already subscribed.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again later.');
      }
      setTimeout(() => setError(''), 3500);
    }
  };

  return (
    <section className="w-full bg-white  py-20">
      <motion.div
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl   mb-4 tracking-tight text-4xl font-bold text-gray-800 mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
        >
          {t('newsletter.title')}
        </motion.h2>
        <motion.p
          className="text-lg text-slate-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {t('newsletter.description')}
        </motion.p>
        <form className="flex flex-col sm:flex-row gap-4 justify-center items-center" onSubmit={handleSubmit}>
          <input
            type="email"
            className="w-full sm:w-72 px-5 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-lg bg-white shadow"
            placeholder={t('newsletter.placeholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={submitted}
            required
          />
          <motion.button
            type="submit"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 text-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.95 }}
            disabled={submitted}
          >
            {submitted ? 'Subscribed!' : t('newsletter.subscribe')}
          </motion.button>
        </form>
        {error && <div className="text-red-500 mt-3 text-sm">{error}</div>}
        {success && (
          <motion.div
            className="mt-6 text-green-600 text-lg font-semibold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {success}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
} 