import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function FeaturesSection() {
  const { t } = useTranslation();
  const features = t('featuresSection.features', { returnObjects: true });
  return (
    <section className="w-full bg-white py-20" id="features">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <span className="inline-block px-5 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm tracking-wider shadow-sm">{t('featuresSection.badge')}</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">{t('featuresSection.title')}</h2>
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {features.map((feature, idx) => (
          <div key={feature.title} className="group bg-white border border-slate-100 rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
            <div className={`w-28 h-28 mb-6 flex items-center justify-center`}>
              {/* Keep the SVGs as is, or optionally use an array of icons if you want to internationalize them too */}
              {idx === 0 && (
                <svg className="w-20 h-20 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              {idx === 1 && (
                <svg className="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {idx === 2 && (
                <svg className="w-20 h-20 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
} 