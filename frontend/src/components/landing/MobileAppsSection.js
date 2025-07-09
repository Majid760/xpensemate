import React from 'react';
import { motion } from 'framer-motion';
import iosAppImg from '../../images/mobileapps.png';
import { useTranslation } from 'react-i18next';

export default function MobileAppsSection() {
  const { t } = useTranslation();
  const mobileFeatures = [
    {
      title: t('mobileApps.features.0.title'),
      description: t('mobileApps.features.0.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: t('mobileApps.features.1.title'),
      description: t('mobileApps.features.1.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      title: t('mobileApps.features.2.title'),
      description: t('mobileApps.features.2.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-5 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm tracking-wider shadow-sm"
          >
            {t('mobileApps.badge')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight"
          >
            {t('mobileApps.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            {t('mobileApps.description')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Mobile Device Mockup */}
          <div className="relative h-[400px] flex items-center justify-center [perspective:800px]">

            <motion.div
              initial={{ opacity: 0, rotateY: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateY: -5, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  delay: 0.3
              }}
              animate={{
                  y: [0, -15, 0],
                  transition: {
                      duration: 5,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'mirror',
                  }
              }}
              className="w-[360px] h-auto"
            >
              <img src={iosAppImg} alt="Mobile App" className="w-full h-auto" whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
 />

            </motion.div>
          </div>

          {/* Features and Download Buttons */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {mobileFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl hover:bg-slate-800 transition-colors duration-200">
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {t('mobileApps.appStore')}
              </button>
              <button className="flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl hover:bg-slate-800 transition-colors duration-200">
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414c-.5511-.2484-1.1109-.3489-1.6785-.3489-1.1902 0-2.3203.5205-3.0708 1.4288-.7505.9083-1.0624 2.1234-.8533 3.3047.1902 1.0744.8388 2.0177 1.7717 2.5839.5156.3127 1.1161.4785 1.7278.4785 1.1902 0 2.3203-.5205 3.0708-1.4288.7505-.9083 1.0624-2.1234.8533-3.3047-.1902-1.0744-.8388-2.0177-1.7717-2.5839l-.0493-.0286zM6.4775 15.3414c-.5511-.2484-1.1109-.3489-1.6785-.3489-1.1902 0-2.3203.5205-3.0708 1.4288-.7505.9083-1.0624 2.1234-.8533 3.3047.1902 1.0744.8388 2.0177 1.7717 2.5839.5156.3127 1.1161.4785 1.7278.4785 1.1902 0 2.3203-.5205 3.0708-1.4288.7505-.9083 1.0624-2.1234.8533-3.3047-.1902-1.0744-.8388-2.0177-1.7717-2.5839l-.0493-.0286zM16.3535 2.1213c-.5511-.2484-1.1109-.3489-1.6785-.3489-1.1902 0-2.3203.5205-3.0708 1.4288-.7505.9083-1.0624 2.1234-.8533 3.3047.1902 1.0744.8388 2.0177 1.7717 2.5839.5156.3127 1.1161.4785 1.7278.4785 1.1902 0 2.3203-.5205 3.0708-1.4288.7505-.9083 1.0624-2.1234.8533-3.3047-.1902-1.0744-.8388-2.0177-1.7717-2.5839l-.0493-.0286z"/>
                </svg>
                {t('mobileApps.playStore')}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 