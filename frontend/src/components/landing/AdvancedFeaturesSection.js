import React from 'react';
import { motion } from 'framer-motion';
import featuresImg from '../../images/features.png';
import { useTranslation } from 'react-i18next';

export default function AdvancedFeaturesSection() {
  const { t } = useTranslation();
  const features = t('advancedFeaturesSection.features', { returnObjects: true });
  const featureItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <section className=" bg-gray-50  py-20 sm:py-24" id="advanced-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm tracking-wider shadow-sm">
            {t('advancedFeaturesSection.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            {t('advancedFeaturesSection.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.img
              src={featuresImg}
              alt="Advanced Features Illustration"
              className="w-full h-auto  object-contain"
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            />

          </motion.div>
          {/* Right Column: Feature List */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={featureItemVariants}
                className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-indigo-300"
              >
                <div className="bg-indigo-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-slate-700">{feature}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
} 