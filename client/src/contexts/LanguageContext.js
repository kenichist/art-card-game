import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Create language context
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language provider component
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  // Update context language when i18n language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.language);
    };

    // Set initial language
    setLanguage(i18n.language);
    
    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);
    
    // Cleanup listener
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Function to change both UI and image languages
  const changeLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
  };

  // Context value
  const contextValue = {
    language,
    changeLanguage,
    isEnglish: language === 'en',
    isChinese: language === 'zh',
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};