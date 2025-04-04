//useTranslator.js
import { useState, useEffect, useRef } from "react";
import { translateText } from "../utils/translation.js";

// Function to save language preference (for backward compatibility)
export const saveLanguage = async (langCode) => {
  // This is handled by LanguageContext now
  console.log('Legacy saveLanguage called:', langCode);
  return true;
};

// Function to get saved language (for backward compatibility)
export const getSavedLanguage = async () => {
  // This is handled by LanguageContext now
  console.log('Legacy getSavedLanguage called');
  return 'en';
};

export default function useTranslator(text, lang) {
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevLangRef = useRef(lang);
  
  // Handle translation
  useEffect(() => {
    // Don't attempt translation if text or language is missing
    if (!text || !lang) {
      console.log('useTranslator: Missing text or language', { text, lang });
      return;
    }

    console.log(`useTranslator: Translating "${text}" to ${lang}`);
    
    // For English or if language hasn't changed, use the original text
    if (lang === 'en' || (prevLangRef.current === lang && translated !== text)) {
      setTranslated(text);
      return;
    }
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // Use our translation utility
    const run = async () => {
      try {
        const result = await translateText(text, lang);
        console.log(`useTranslator: Translation result: "${result}"`);
        if (isMounted) {
          setTranslated(result);
        }
      } catch (err) {
        console.error('useTranslator: Translation error:', err);
        if (isMounted) {
          setError(err.message || 'Translation failed');
          // Keep the original text on error
          setTranslated(text);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    run();
    
    // Update reference for next comparison
    prevLangRef.current = lang;
    
    return () => {
      isMounted = false;
    };
  }, [text, lang]); 

  return translated;
}
