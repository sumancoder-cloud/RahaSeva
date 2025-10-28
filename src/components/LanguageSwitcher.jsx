import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../context/translations';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' }
  ];

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-all duration-300"
        title={t(language, 'language.selectLanguage')}
      >
        <i className="fas fa-globe"></i>
        <span className="hidden md:inline">{language.toUpperCase()}</span>
        <i className={`fas fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-orange-300 min-w-[150px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                language === lang.code
                  ? 'bg-orange-100 text-orange-700 font-bold'
                  : 'text-gray-800 hover:bg-orange-50'
              }`}
            >
              {language === lang.code && (
                <i className="fas fa-check text-orange-600"></i>
              )}
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
