import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  // load translation using http -> see /public/locales (relative to public folder)
  .use(HttpApi)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    supportedLngs: ['en', 'zh'], // Supported languages
    fallbackLng: 'en', // Fallback language
    debug: process.env.NODE_ENV === 'development', // Enable debug in dev mode

    interpolation: {
      escapeValue: false, // React already safes from xss
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    backend: {
      // path where resources get loaded from, relative to public folder
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Default namespace
    ns: ['translation'],
    defaultNS: 'translation',
  });

export default i18n;