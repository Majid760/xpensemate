import React, { useState } from 'react';
import Toast from './Toast';
import { useTranslation } from 'react-i18next';

const SupportSection = () => {
  const { t } = useTranslation();
  const [reportName, setReportName] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    // Reset states
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/support/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // This ensures cookies are sent
        body: JSON.stringify({
          reportName,
          reportDetails,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }
      
      setSuccess(data.message || 'Support request submitted successfully');
      // Reset form
      setReportName('');
      setReportDetails('');
    } catch (err) {
      console.error('Support request error:', err);
      setError(err.message || 'Failed to submit report. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full font-sans p-4 sm:p-6 lg:p-0">
      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={() => setError('')}
        />
      )}
      {success && (
        <Toast 
          message={success} 
          type="success" 
          onClose={() => setSuccess('')}
        />
      )}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 max-w-5xl mx-auto  transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-3">
              <span>{t('supportContent.title')}</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg mb-2">{t('supportContent.description')}</p>
          </div>
          {/* Email Contact Section */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <a 
                href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`} 
                className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all duration-200 text-sm sm:text-base shadow-sm border border-indigo-100"
              >
                {process.env.REACT_APP_SUPPORT_EMAIL}
              </a>
          
            </div>
            <p className="text-slate-400 text-sm sm:text-base">{t('supportContent.or')}</p>
          </div>
          {/* Support Form */}
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <div>
              <label 
                htmlFor="reportName" 
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                {t('supportContent.reportName')}
              </label>
              <input
                type="text"
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder={t('supportContent.reportNamePlaceholder')}
                disabled={isLoading}
              />
            </div>
            <div>
              <label 
                htmlFor="reportDetails" 
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                {t('supportContent.reportDetails')}
              </label>
              <textarea
                id="reportDetails"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={7}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y"
                placeholder={t('supportContent.reportDetailsPlaceholder')}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all duration-200 font-bold active:scale-95 shadow-lg shadow-indigo-500/20 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">{t('supportContent.submitting')}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  t('supportContent.submit')
                )}
              </button>
            </div>
          </form>
          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-slate-400 text-xs sm:text-sm">
              {t('supportContent.footerNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportSection;