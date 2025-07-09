import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PricingSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const plans = t('pricingSection.plans', { returnObjects: true });

  return (
    <section className="w-full bg-slate-50 py-24" id="pricing">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm tracking-wider shadow-sm">{t('pricingSection.badge')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">{t('pricingSection.title')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('pricingSection.description')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: plan.highlight ? 1.10 : 1.06, boxShadow: '0 12px 32px 0 rgba(80, 80, 180, 0.10)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.25 }}
              viewport={{ once: true, amount: 0.3 }}
              className={`flex flex-col rounded-3xl shadow-xl border border-slate-100 bg-white p-8 text-center relative z-10 group transition-all duration-300
                ${plan.highlight ? 'ring-2 ring-indigo-500' : ''}
              `}
            >
              <div className="mb-4">
                <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-wider ${plan.highlight ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{plan.name}</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-800">{plan.price}</span>
                <span className="text-lg text-slate-500 font-medium ml-1">{plan.period}</span>
              </div>
              <ul className="mb-8 space-y-3 text-slate-600 text-left mx-auto max-w-xs">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-bold text-lg transition-colors duration-200 ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-indigo-700 hover:bg-indigo-200'}`}
                onClick={() => navigate('/login')}
              >{plan.cta}</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 