import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const socials = [
  { name: 'Twitter', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.01-4.52 4.5 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.78 2.86 1.97 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.91 3.55 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 21.54a12.8 12.8 0 006.95 2.03c8.36 0 12.94-6.92 12.94-12.93 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg>
    ), url: '#' },
  { name: 'Facebook', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
    ), url: '#' },
  { name: 'LinkedIn', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75c.97 0 1.75.79 1.75 1.75s-.78 1.75-1.75 1.75zm15.25 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72zm-12.25-9h-.03c-.01 0-.01 0-.02 0z"/></svg>
    ), url: '#' },
  { name: 'Instagram', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.783 2.225 7.149 2.163 8.415 2.105 8.795 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344 2.697 2.325 2.465 3.437 2.406 4.718 2.347 5.998 2.334 6.407 2.334 12c0 5.593.013 6.002.072 7.282.059 1.281.291 2.393 1.272 3.374.981.981 2.093 1.213 3.374 1.272 1.28.059 1.689.072 7.282.072s6.002-.013 7.282-.072c1.281-.059 2.393-.291 3.374-1.272.981-.981 1.213-2.093 1.272-3.374.059-1.28.072-1.689.072-7.282s-.013-6.002-.072-7.282c-.059-1.281-.291-2.393-1.272-3.374C19.393.363 18.281.131 17 .072 15.719.013 15.309 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
    ), url: '#' },
];

export default function FooterGrid() {
  const { t } = useTranslation();
  const usefulLinks = t('footer.usefulLinks', { returnObjects: true });
  return (
    <section className="w-full bg-white/30 py-12 border-t border-slate-200">
      <motion.div
        className="max-w-6xl w-full mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-8 md:gap-y-0 md:gap-x-12 text-left"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {/* Brand/Info */}
        <div>
          <h3 className="text-2xl font-bold text-blue-900 mb-2">{t('footer.brand')}</h3>
          <div className="text-gray-700 mb-2" style={{ whiteSpace: 'pre-line' }}>{t('footer.address')}</div>
          <div className="text-gray-700 mb-2"><span className="font-bold">{t('footer.phoneLabel')}</span> {process.env.REACT_APP_PHONE}</div>
          <div className="text-gray-700 mb-2"><span className="font-bold">{t('footer.emailLabel')}</span> {process.env.REACT_APP_INFO_EMAIL}</div>
        </div>
        {/* Useful Links */}
        <div>
          <h4 className="text-lg font-semibold text-blue-900 mb-4">{t('footer.usefulLinksTitle')}</h4>
          <ul className="flex flex-col gap-2 items-start">
            {usefulLinks.map(link => (
              <li key={link.label} className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                {link.url && link.url.startsWith('/') ? (
                  <Link to={link.url}>{link.label}</Link>
                ) : (
                  <a href={link.url}>{link.label}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Follow Us */}
        <div>
          <h4 className="text-lg font-semibold text-blue-900 mb-4">{t('footer.followUsTitle')}</h4>
          <div className="text-gray-600 mb-4">{t('footer.followUsDescription')}</div>
          <div className="flex gap-3 justify-start">
            {socials.map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-blue-200 rounded-xl p-3 bg-white shadow-md transition-all duration-200 hover:bg-blue-100 hover:scale-110 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label={social.name}
              >
                <span className="sr-only">{social.name}</span>
                <span className="text-blue-500 group-hover:text-blue-700 transition-colors duration-200">
                  {React.cloneElement(social.icon, { className: 'w-7 h-7' })}
                </span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
} 