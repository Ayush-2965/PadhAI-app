import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadSavedLanguage, saveLanguagePreference, LANGUAGES } from '../utils/i18n';

// Create a context for language state
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(true);

  // Load the saved language on app start
  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await loadSavedLanguage();
      setLanguage(savedLanguage);
      setIsLoading(false);
    };

    loadLanguage();
  }, []);

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setLanguage(languageCode);
      await saveLanguagePreference(languageCode);
      return true;
    }
    return false;
  };

  // Context value
  const value = {
    language,
    changeLanguage,
    isLoading,
    availableLanguages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 