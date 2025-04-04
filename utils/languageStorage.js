/**
 * Global language storage utility
 * 
 * This module provides functions to save and retrieve the selected language
 * across the entire application, ensuring consistent language support.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Keys for storage
const LANGUAGE_KEY = 'user_language';
const LANGUAGE_MEMORY = { currentLanguage: 'en' }; // In-memory fallback

/**
 * Save the selected language to secure storage and memory
 * 
 * @param {string} languageCode - ISO language code to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveLanguage = async (languageCode) => {
  try {
    // Update in-memory copy immediately
    LANGUAGE_MEMORY.currentLanguage = languageCode;
    
    // Save to persistent storage
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(LANGUAGE_KEY, languageCode);
    } else {
      // For web, use localStorage
      localStorage.setItem(LANGUAGE_KEY, languageCode);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving language:', error);
    return false;
  }
};

/**
 * Get the user's selected language
 * 
 * @returns {Promise<string>} - The ISO language code or 'en' if not found
 */
export const getLanguage = async () => {
  try {
    let savedLanguage;
    
    // Try to get from persistent storage
    if (Platform.OS !== 'web') {
      savedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
    } else {
      // For web, use localStorage
      savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    }
    
    if (savedLanguage) {
      // Update memory copy and return
      LANGUAGE_MEMORY.currentLanguage = savedLanguage;
      return savedLanguage;
    }
    
    // Return in-memory version if available
    return LANGUAGE_MEMORY.currentLanguage;
  } catch (error) {
    console.error('Error getting language:', error);
    // Return in-memory version as fallback
    return LANGUAGE_MEMORY.currentLanguage;
  }
};

/**
 * Get the current language synchronously (from memory)
 * Use this when you need the language immediately without await
 * 
 * @returns {string} - The current language code
 */
export const getCurrentLanguageSync = () => {
  return LANGUAGE_MEMORY.currentLanguage;
};

/**
 * Set the current language in memory
 * This is typically called by the LanguageContext after loading from storage
 * 
 * @param {string} languageCode - The language code to set
 */
export const setCurrentLanguageSync = (languageCode) => {
  LANGUAGE_MEMORY.currentLanguage = languageCode;
}; 