import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { changeLanguage } = useLanguage();

  // Define language names for the dropdown
  const languages = {
    en: { nativeName: 'English' },
    zh: { nativeName: '中文 (简体)' } // Simplified Chinese
  };

  // Custom popper configuration to ensure dropdown appears in front
  const popperConfig = {
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          rootBoundary: 'viewport',
        },
      },
    ],
    strategy: 'fixed',
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-light" id="language-dropdown" size="sm">
        {/* Display current language name */}
        {languages[i18n.resolvedLanguage]?.nativeName || 'Language'}
      </Dropdown.Toggle>

      <Dropdown.Menu popperConfig={popperConfig} style={{ zIndex: 9999 }}>
        {/* Map through defined languages to create dropdown items */}
        {Object.keys(languages).map((lng) => (
          <Dropdown.Item
            key={lng}
            active={i18n.resolvedLanguage === lng}
            onClick={() => changeLanguage(lng)}
          >
            {languages[lng].nativeName}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;