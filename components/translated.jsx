import React, { useState, useEffect, memo } from 'react';
import { Text } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../utils/translation';
import useAppTranslation from '../utils/useAppTranslation';

// Cache for translated text to avoid repeated translations
const translationCache = {};

/**
 * TranslatedText component for efficient multilingual text rendering
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The text to translate
 * @param {string} props.className - TailwindCSS classes
 * @param {Object} props.style - React Native style object
 * @param {string} props.forceLang - Force a specific language (optional)
 * @param {React.ReactNode} props.children - Children (used as fallback if no text is provided)
 * @returns {React.ReactNode} - The translated text component
 */
const TranslatedText = ({ text, className, style, forceLang, children, ...otherProps }) => {
  const { currentLanguage, isInitialized } = useLanguage();
  const { translateSync } = useAppTranslation();
  const [translatedText, setTranslatedText] = useState(() => 
    // Initialize with sync translation for immediate display
    translateSync(text) || text || ''
  );
  const [isLoading, setIsLoading] = useState(true);
  
  // Use forceLang if provided, otherwise use the app's current language
  const targetLanguage = forceLang || currentLanguage;
  
  // Translate the text when language changes or text changes
  useEffect(() => {
    // Skip if no text or not initialized
    if (!text || !isInitialized) {
      setTranslatedText(text || '');
      setIsLoading(false);
      return;
    }

    // Create a cache key combining text and language
    const cacheKey = `${text}_${targetLanguage}`;
    
    // If already in cache, use it immediately
    if (translationCache[cacheKey]) {
      setTranslatedText(translationCache[cacheKey]);
      setIsLoading(false);
      return;
    }
    
    // Set to loading state but keep showing the current text
    setIsLoading(true);
    
    // Translate the text
    const translateAsync = async () => {
      try {
        // English text doesn't need translation
        if (targetLanguage === 'en') {
          setTranslatedText(text);
          translationCache[cacheKey] = text;
          setIsLoading(false);
          return;
        }
        
        // Get translation from the API or cache
        const result = await translateText(text, targetLanguage);
        
        // Store in component state
        setTranslatedText(result);
        
        // Store in memory cache for future use
        translationCache[cacheKey] = result;
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original text on error
        setTranslatedText(text);
      } finally {
        setIsLoading(false);
      }
    };
    
    translateAsync();
  }, [text, targetLanguage, isInitialized, translateSync]);
  
  // Show the translated text immediately (not loading state)
  return (
    <Text className={className} style={style} {...otherProps}>
      {translatedText || children || ''}
    </Text>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(TranslatedText);