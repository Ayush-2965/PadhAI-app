import { useState, useEffect } from 'react';
import { translateText } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';

/**
 * Custom hook to translate data objects or arrays
 * 
 * @param {object|array|string} data - The data to translate
 * @param {array} textFields - Array of field keys that should be translated (for objects)
 * @param {boolean} deepTranslate - Whether to translate nested objects
 * @returns {object} - Contains translated data, loading state, and error
 */
const useTranslatedData = (data, textFields = [], deepTranslate = false) => {
  const { language } = useLanguage();
  const [translatedData, setTranslatedData] = useState(data);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const translateData = async () => {
      if (!data) {
        setTranslatedData(data);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Handle string data
        if (typeof data === 'string') {
          const translated = await translateText(data, language);
          if (isMounted) {
            setTranslatedData(translated);
          }
        } 
        // Handle array data
        else if (Array.isArray(data)) {
          const translatedArray = await Promise.all(
            data.map(async (item) => {
              if (typeof item === 'string') {
                return await translateText(item, language);
              } else if (typeof item === 'object' && item !== null) {
                return await translateObject(item, textFields, deepTranslate);
              }
              return item;
            })
          );
          
          if (isMounted) {
            setTranslatedData(translatedArray);
          }
        } 
        // Handle object data
        else if (typeof data === 'object' && data !== null) {
          const translatedObj = await translateObject(data, textFields, deepTranslate);
          if (isMounted) {
            setTranslatedData(translatedObj);
          }
        } else {
          // Other data types are returned as is
          if (isMounted) {
            setTranslatedData(data);
          }
        }
      } catch (err) {
        console.error('Translation error:', err);
        if (isMounted) {
          setError(err);
          setTranslatedData(data); // Fallback to original data
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    translateData();

    return () => {
      isMounted = false;
    };
  }, [data, language, textFields, deepTranslate]);

  // Helper function to translate an object
  const translateObject = async (obj, fields, deep) => {
    const newObj = { ...obj };
    
    for (const key in newObj) {
      // Only translate specified fields or all fields if textFields is empty
      if (fields.length === 0 || fields.includes(key)) {
        if (typeof newObj[key] === 'string') {
          newObj[key] = await translateText(newObj[key], language);
        }
      }
      
      // Recursively translate nested objects if deepTranslate is true
      if (deep && typeof newObj[key] === 'object' && newObj[key] !== null) {
        if (Array.isArray(newObj[key])) {
          newObj[key] = await Promise.all(
            newObj[key].map(async (item) => {
              if (typeof item === 'string') {
                return await translateText(item, language);
              } else if (typeof item === 'object' && item !== null) {
                return await translateObject(item, fields, deep);
              }
              return item;
            })
          );
        } else {
          newObj[key] = await translateObject(newObj[key], fields, deep);
        }
      }
    }
    
    return newObj;
  };

  return { translatedData, isLoading, error };
};

export default useTranslatedData; 