import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { translateText } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';

/**
 * TranslatedText component for rendering text in the user's selected language
 * 
 * @param {object} props
 * @param {string} props.text - Original text to be translated
 * @param {object} props.style - Style object for the Text component
 * @param {object} props.textProps - Additional props for the Text component
 */
const TranslatedText = ({ text, style, ...textProps }) => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const translateContent = async () => {
      setIsLoading(true);
      try {
        const result = await translateText(text, language);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(text); // Fallback to original text
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (text && language) {
      translateContent();
    } else {
      setTranslatedText(text || '');
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [text, language]);

  return (
    <Text style={style} {...textProps}>
      {isLoading ? text : translatedText}
    </Text>
  );
};

export default TranslatedText; 