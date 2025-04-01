import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Define language names for the dropdown
  const languages = {
    en: { nativeName: 'English' },
    zh: { nativeName: '中文 (简体)' } // Simplified Chinese
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-light" id="language-dropdown" size="sm">
        {/* Display current language name */}
        {languages[i18n.resolvedLanguage]?.nativeName || 'Language'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
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