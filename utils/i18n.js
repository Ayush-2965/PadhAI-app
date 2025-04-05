import translate from 'translate';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure the translation engine
translate.engine = "google";
translate.key = process.env.DEEPL_KEY;

// Available languages in the app
export const LANGUAGES = {
  en: { code: 'en', name: 'English' },
  hi: { code: 'hi', name: 'हिंदी' },
  bn: { code: 'bn', name: 'বাংলা' },
  kn: { code: 'kn', name: 'ಕನ್ನಡ' },
  ta: { code: 'ta', name: 'தமிழ்' },
  pa: { code: 'pa', name: 'ਗੁਰਮੁਖੀ' },
};

// Storage key for saving language preference
const LANGUAGE_STORAGE_KEY = 'app_language';

// Get the device language or default to English
export const getDeviceLanguage = () => {
  const locale = 
    navigator?.language || // For web
    navigator?.userLanguage || // For old browsers
    'en'; // Default to English
  
  const languageCode = locale.split('-')[0]; // Get the language code part only
  return LANGUAGES[languageCode] ? languageCode : 'en';
};

// Load the saved language preference
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage || getDeviceLanguage();
  } catch (error) {
    console.error('Error loading language preference:', error);
    return 'en';
  }
};

// Save language preference
export const saveLanguagePreference = async (languageCode) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    return true;
  } catch (error) {
    console.error('Error saving language preference:', error);
    return false;
  }
};

// Translation cache to avoid unnecessary API calls
const translationCache = {};

// Translate text to target language
export const translateText = async (text, targetLang = 'en') => {
  // If the text is empty, return it as is
  if (!text) return text;
  
  // Check cache first
  const cacheKey = `${text}:${targetLang}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  
  try {
    const translatedText = await translate(text, targetLang);
    translationCache[cacheKey] = translatedText;
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

// Custom hook for translating text in components
export const useTranslation = (targetLang) => {
  const t = async (text) => {
    if (!text) return '';
    return await translateText(text, targetLang);
  };
  
  return { t };
}; 