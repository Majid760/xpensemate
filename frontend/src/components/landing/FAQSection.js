import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function FAQSection() {
  const { t } = useTranslation();
  const faqs = t('faqSection.faqs', { returnObjects: true });
  const [openIdx, setOpenIdx] = React.useState(null);
  return (
    <section className="w-full bg-white py-24" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm tracking-wider shadow-sm">{t('faqSection.badge')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">{t('faqSection.title')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('faqSection.description')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              className="flex justify-center"
            >
              <div className="w-full max-w-lg">
                <button
                  className={`w-full flex justify-between items-center px-6 py-5 bg-slate-50 rounded-2xl shadow-sm text-left text-lg font-semibold text-slate-800 focus:outline-none transition-colors duration-200 ${openIdx === idx ? 'bg-indigo-50' : 'hover:bg-slate-100'}`}
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  aria-expanded={openIdx === idx}
                >
                  <span>{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openIdx === idx ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 text-indigo-500"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openIdx === idx ? 'auto' : 0, opacity: openIdx === idx ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden px-6"
                >
                  {openIdx === idx && (
                    <div className="py-4 text-slate-600 text-base leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 