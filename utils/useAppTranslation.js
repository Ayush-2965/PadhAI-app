import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText, translateTextSync } from './translation';
import { getCurrentLanguageSync } from './languageStorage';

/**
 * Custom hook for translations throughout the app
 * Provides functions for translating text and objects
 * 
 * @returns {Object} Translation utilities
 */
const useAppTranslation = () => {
  const { currentLanguage, isInitialized } = useLanguage();
  
  // Get a safe language code even if context isn't ready yet
  const safeLanguage = currentLanguage || getCurrentLanguageSync() || 'en';

  /**
   * Translate a text string
   * @param {string} text - The text to translate
   * @param {string} [targetLang] - Optional target language (defaults to current language)
   * @returns {Promise<string>} - The translated text
   */
  const translate = useCallback(async (text, targetLang = safeLanguage) => {
    if (!text || typeof text !== 'string') return text;
    
    try {
      // If language isn't initialized yet, still attempt translation with fallback
      return await translateText(text, targetLang);
    } catch (error) {
      console.error('Translation error in hook:', error);
      return text; // Fallback to original text
    }
  }, [safeLanguage]);

  /**
   * Translate an object's string properties
   * @param {Object} obj - The object with properties to translate
   * @param {string} [targetLang] - Optional target language (defaults to current language)
   * @returns {Promise<Object>} - The object with translated properties
   */
  const translateObject = useCallback(async (obj, targetLang = safeLanguage) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    try {
      const result = Array.isArray(obj) ? [...obj] : {...obj};
      
      for (const key in result) {
        if (typeof result[key] === 'string') {
          result[key] = await translateText(result[key], targetLang);
        } else if (typeof result[key] === 'object' && result[key] !== null) {
          result[key] = await translateObject(result[key], targetLang);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Object translation error:', error);
      return obj; // Fallback to original object
    }
  }, [safeLanguage]);

  /**
   * Get a synchronous translation that falls back to the text itself
   * Useful when you need a translation right away and can't wait
   * For UI elements that need immediate display
   * 
   * @param {string} text - Text to translate
   * @returns {string} - Best effort translation or original text
   */
  const translateSync = useCallback((text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Use the new synchronous translation function
    return translateTextSync(text, safeLanguage);
  }, [safeLanguage]);

  /**
   * Synchronously translate an object's string properties
   * Useful for immediate UI updates
   * 
   * @param {Object} obj - The object with properties to translate 
   * @returns {Object} - The object with translated properties
   */
  const translateObjectSync = useCallback((obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = Array.isArray(obj) ? [...obj] : {...obj};
    
    // Process each property
    for (const key in result) {
      if (typeof result[key] === 'string') {
        result[key] = translateTextSync(result[key], safeLanguage);
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = translateObjectSync(result[key]);
      }
    }
    
    return result;
  }, [safeLanguage]);

  return {
    currentLanguage: safeLanguage,
    translate,
    translateObject,
    translateSync,
    translateObjectSync,
    isInitialized
  };
};

export default useAppTranslation; 