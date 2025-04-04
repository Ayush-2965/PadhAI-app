import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { saveLanguage, getLanguage, setCurrentLanguageSync } from '../utils/languageStorage';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', symbol: 'A', name: 'English' },
  { code: 'hi', symbol: 'क', name: 'हिंदी' },
  { code: 'bn', symbol: 'ক', name: 'বাংলা' },
  { code: 'kn', symbol: 'ಠ', name: 'ಕನ್ನಡ' },
  { code: 'ta', symbol: 'க', name: 'தமிழ்' },
  { code: 'pa', symbol: 'ਕ', name: 'ਗੁਰਮੁਖੀ' },
  { code: 'te', symbol: 'క', name: 'తెలుగు' },
  { code: 'gu', symbol: 'ક', name: 'ગુજરાતી' },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  console.log('LanguageProvider: Initializing...');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language on mount only
  useEffect(() => {
    console.log('LanguageProvider: Running initial effect...');
    let isMounted = true;
    
    const loadLanguage = async () => {
      console.log('LanguageProvider: Loading saved language...');
      try {
        const savedLang = await getLanguage();
        console.log('LanguageProvider: Saved language from storage:', savedLang);
        
        if (isMounted) {
          if (savedLang) {
            setCurrentLanguage(savedLang);
            setCurrentLanguageSync(savedLang); // Update sync version too
            console.log('LanguageProvider: Language set to:', savedLang);
          } else {
            console.log('LanguageProvider: No saved language found, using default: en');
            // Ensure we save the default language if none exists
            await saveLanguage('en');
            setCurrentLanguageSync('en');
          }
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('LanguageProvider: Error loading language:', error);
        if (isMounted) {
          setIsLoading(false);
          // Even on error, mark as initialized so app can continue
          setIsInitialized(true);
        }
      }
    };
    
    loadLanguage();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize the change language function to prevent unnecessary re-renders
  const changeLanguage = useCallback(async (langCode) => {
    console.log('LanguageProvider: Changing language to:', langCode);
    if (langCode === currentLanguage) {
      console.log('LanguageProvider: Language already set to', langCode);
      return;
    }
    
    try {
      // Save using the centralized utility
      const success = await saveLanguage(langCode);
      
      if (success) {
        setCurrentLanguage(langCode);
        console.log('LanguageProvider: Language changed successfully');
      } else {
        console.error('LanguageProvider: Failed to save language');
        // Still update the in-memory state even if storage fails
        setCurrentLanguage(langCode);
        setCurrentLanguageSync(langCode);
      }
    } catch (error) {
      console.error('LanguageProvider: Error saving language:', error);
      // Still update the in-memory state even if storage fails
      setCurrentLanguage(langCode);
      setCurrentLanguageSync(langCode);
    }
  }, [currentLanguage]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentLanguage,
    changeLanguage,
    isLoading,
    isInitialized,
    supportedLanguages: SUPPORTED_LANGUAGES
  }), [currentLanguage, changeLanguage, isLoading, isInitialized]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 