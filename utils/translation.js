//translator.js
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import { translateOffline, getOfflineTranslationQuality } from './offlineTranslation';

const CACHE_KEY = "translations_cache";

// Use Google Translate API for better reliability and accuracy - no API key needed
const GOOGLE_TRANSLATE_API = "https://translate.googleapis.com/translate_a/single";

// Language support verification
// Google Translate has excellent support for all these languages
const SUPPORTED_API_LANGUAGES = {
  'en': true, // English
  'hi': true, // Hindi
  'bn': true, // Bengali
  'kn': true, // Kannada - fully supported
  'ta': true, // Tamil
  'te': true, // Telugu
  'gu': true, // Gujarati - fully supported
  'pa': true, // Punjabi - fully supported
  'mr': true, // Marathi
  'ml': true, // Malayalam
  'or': true, // Odia
  'as': true, // Assamese
  'ur': true, // Urdu
  'sa': true, // Sanskrit
};

// Language code mapping for the API (Google uses standard ISO codes)
const LANGUAGE_CODE_MAPPING = {
  'pa': 'pa', // Punjabi
  'zh': 'zh-CN', // Chinese
  'hi': 'hi',
  'bn': 'bn',
  'kn': 'kn',
  'ta': 'ta',
  'te': 'te',
  'gu': 'gu',
  'mr': 'mr',
  'ml': 'ml',
  'or': 'or',
  'as': 'as',
  'ur': 'ur',
  'sa': 'sa',
};

// Export mockTranslations for direct access in useAppTranslation
export const mockTranslations = {
  hi: {
    "Welcome to the Tabs Screen!": "टैब स्क्रीन में आपका स्वागत है!",
    "Change Language": "भाषा बदलें",
    "Choose a Language": "एक भाषा चुनें",
    "Next": "आगे बढ़ें",
    "Select your preferred language below:": "नीचे अपनी पसंदीदा भाषा चुनें:",
    
    // Profile page
    "Profile": "प्रोफ़ाइल",
    "Logout": "लॉग आउट",
    
    // Planner page
    "Craft Your Ideal Study Plan": "अपनी आदर्श अध्ययन योजना बनाएँ",
    "Choose your deadline:": "अपनी समय सीमा चुनें:",
    "From": "से",
    "To": "तक",
    "Time Slots": "समय स्लॉट",
    "+ Add Slot": "+ स्लॉट जोड़ें",
    "From:": "से:",
    "To:": "तक:",
    "Subjects & Topics": "विषय और टॉपिक्स",
    "+ Add Subject": "+ विषय जोड़ें",
    "No subjects added yet": "अभी तक कोई विषय नहीं जोड़ा गया",
    "Edit Subject": "विषय संपादित करें",
    "Add New Subject": "नया विषय जोड़ें",
    "Subject name*": "विषय का नाम*",
    "Enter topics, separated by commas*": "टॉपिक्स दर्ज करें, अल्पविराम से अलग करें*",
    "Cancel": "रद्द करें",
    "Update": "अपडेट करें",
    "Add": "जोड़ें",
    "Set Subject & Topic Proficiency": "विषय और टॉपिक प्रवीणता सेट करें",
    "Subjects Proficiency": "विषय प्रवीणता",
    "No subjects added": "कोई विषय नहीं जोड़ा गया",
    "Topics Proficiency": "टॉपिक प्रवीणता",
    "No subjects available": "कोई विषय उपलब्ध नहीं है",
    "No topics added": "कोई टॉपिक नहीं जोड़ा गया",
    "Easy": "आसान",
    "Moderate": "मध्यम",
    "Hard": "कठिन",
    "Review & Confirm": "समीक्षा और पुष्टिकरण",
    "Time Slots:": "समय स्लॉट:",
    "Subjects:": "विषय:",
    "Confirm": "पुष्टि करें",
    "Previous": "पिछला",
    
    // Alerts
    "Invalid Time": "अमान्य समय",
    "End time must be after start time": "समाप्ति समय प्रारंभ समय के बाद होना चाहिए",
    "Invalid Duration": "अमान्य अवधि",
    "Minimum slot duration is 1 hour": "न्यूनतम स्लॉट अवधि 1 घंटा है",
    "Maximum slot duration is 3 hours": "अधिकतम स्लॉट अवधि 3 घंटे है",
    "Limit Reached": "सीमा पूरी हो गई",
    "Maximum 5 time slots allowed": "अधिकतम 5 समय स्लॉट अनुमति है",
    "Invalid Slot": "अमान्य स्लॉट",
    "This slot overlaps with existing slots": "यह स्लॉट मौजूदा स्लॉट्स के साथ ओवरलैप होता है",
    "Cannot Delete": "हटा नहीं सकते",
    "At least one time slot is required": "कम से कम एक समय स्लॉट आवश्यक है",
    "Required": "आवश्यक",
    "Subject name is required": "विषय का नाम आवश्यक है",
    "At least one topic is required": "कम से कम एक टॉपिक आवश्यक है",
    "Cannot Remove": "हटा नहीं सकते",
    
    // Template page
    "New Page": "नया पेज",
    "This is a template for creating new pages with translation support.": "यह अनुवाद समर्थन के साथ नए पेज बनाने के लिए एक टेम्पलेट है।",
    "Page Title": "पेज का शीर्षक",
    "This is a description of the page content.": "यह पेज सामग्री का विवरण है।",
    "First Item": "पहला आइटम",
    "Second Item": "दूसरा आइटम",
    "Third Item": "तीसरा आइटम",
    "Go Back": "वापस जाएं",
    
    // Common dynamic content
    "Slot 1:": "स्लॉट 1:", 
    "Slot 2:": "स्लॉट 2:", 
    "Slot 3:": "स्लॉट 3:", 
    "Slot 4:": "स्लॉट 4:", 
    "Slot 5:": "स्लॉट 5:"
  },
  bn: {
    "Welcome to the Tabs Screen!": "ট্যাব স্ক্রীনে আপনাকে স্বাগতম!",
    "Change Language": "ভাষা পরিবর্তন করুন",
    "Choose a Language": "একটি ভাষা নির্বাচন করুন",
    "Next": "পরবর্তী",
    "Select your preferred language below:": "নীচে আপনার পছন্দসই ভাষা নির্বাচন করুন:",
    
    // Profile page
    "Profile": "প্রোফাইল",
    "Logout": "লগ আউট",
    
    // Common planner terms
    "Craft Your Ideal Study Plan": "আপনার আদর্শ অধ্যয়ন পরিকল্পনা তৈরি করুন",
    "From": "থেকে",
    "To": "পর্যন্ত",
    "Previous": "আগের",
    "Confirm": "নিশ্চিত করুন",
    
    // Common dynamic content
    "Slot 1:": "স্লট 1:", 
    "Slot 2:": "স্লট 2:", 
    "Slot 3:": "স্লট 3:", 
    "Slot 4:": "স্লট 4:", 
    "Slot 5:": "স্লট 5:"
  },
  ta: {
    "Welcome to the Tabs Screen!": "தாவல் திரைக்கு வரவேற்கிறோம்!",
    "Change Language": "மொழியை மாற்று",
    "Choose a Language": "ஒரு மொழியைத் தேர்ந்தெடுக்கவும்",
    "Next": "அடுத்து",
    "Select your preferred language below:": "கீழே உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்:",
    
    // Profile page
    "Profile": "சுயவிவரம்",
    "Logout": "வெளியேறு",
    
    // Common dynamic content
    "Slot 1:": "ஸ்லாட் 1:", 
    "Slot 2:": "ஸ்லாட் 2:", 
    "Slot 3:": "ஸ்லாட் 3:", 
    "Slot 4:": "ஸ்லாட் 4:", 
    "Slot 5:": "ஸ்லாட் 5:"
  },
  kn: {
    "Welcome to the Tabs Screen!": "ಟ್ಯಾಬ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸುಸ್ವಾಗತ!",
    "Change Language": "ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ",
    "Choose a Language": "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Next": "ಮುಂದೆ",
    "Select your preferred language below:": "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ:",
    
    // Common dynamic content
    "Slot 1:": "ಸ್ಲಾಟ್ 1:", 
    "Slot 2:": "ಸ್ಲಾಟ್ 2:", 
    "Slot 3:": "ಸ್ಲಾಟ್ 3:", 
    "Slot 4:": "ಸ್ಲಾಟ್ 4:", 
    "Slot 5:": "ಸ್ಲಾಟ್ 5:"
  },
  te: {
    "Welcome to the Tabs Screen!": "ట్యాబ్స్ స్క్రీన్‌కి స్వాగతం!",
    "Change Language": "భాష మార్చండి",
    "Choose a Language": "భాషను ఎంచుకోండి",
    "Next": "తరువాత",
    "Select your preferred language below:": "కింద మీకు నచ్చిన భాషను ఎంచుకోండి:",
    
    // Common dynamic content
    "Slot 1:": "స్లాట్ 1:", 
    "Slot 2:": "స్లాట్ 2:", 
    "Slot 3:": "స్లాట్ 3:", 
    "Slot 4:": "స్లాట్ 4:", 
    "Slot 5:": "స్లాట్ 5:"
  },
  gu: {
    "Welcome to the Tabs Screen!": "ટેબ્સ સ્ક્રીન પર આપનું સ્વાગત છે!",
    "Change Language": "ભાષા બદલો",
    "Choose a Language": "ભાષા પસંદ કરો",
    "Next": "આગળ",
    "Select your preferred language below:": "નીચે તમારી પસંદની ભાષા પસંદ કરો:",
    
    // Common dynamic content
    "Slot 1:": "સ્લોટ 1:", 
    "Slot 2:": "સ્લોટ 2:", 
    "Slot 3:": "સ્લોટ 3:", 
    "Slot 4:": "સ્લોટ 4:", 
    "Slot 5:": "સ્લોટ 5:"
  },
  pa: {
    "Welcome to the Tabs Screen!": "ਟੈਬਜ਼ ਸਕ੍ਰੀਨ 'ਤੇ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ!",
    "Change Language": "ਭਾਸ਼ਾ ਬਦਲੋ",
    "Choose a Language": "ਭਾਸ਼ਾ ਚੁਣੋ",
    "Next": "ਅਗਲਾ",
    "Select your preferred language below:": "ਹੇਠਾਂ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਦੀ ਚੋਣ ਕਰੋ:",
    
    // Common dynamic content
    "Slot 1:": "ਸਲਾਟ 1:", 
    "Slot 2:": "ਸਲਾਟ 2:", 
    "Slot 3:": "ਸਲਾਟ 3:", 
    "Slot 4:": "ਸਲਾਟ 4:", 
    "Slot 5:": "ਸਲਾਟ 5:"
  }
};

// Global flag for offline mode to avoid repeated network checks
let isOfflineMode = false; // Default to online mode to allow API translations

/**
 * Check if the device is online
 * @returns {Promise<boolean>} 
 */
const checkNetworkStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    console.error("Error checking network status:", error);
    return false;
  }
};

/**
 * Get cached translations from secure storage
 * @returns {Promise<Object>} Cached translations
 */
export const getCachedTranslations = async () => {
  try {
    const cache = await SecureStore.getItemAsync(CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch (error) {
    console.error("Error getting cached translations:", error);
    return {};
  }
};

/**
 * Save translations to secure storage
 * @param {Object} cache - Translations to cache
 */
export const saveCachedTranslations = async (cache) => {
  try {
    await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving cached translations:", error);
  }
};

/**
 * Simple word substitution fallback when API fails
 * Maps common English words to their translations
 */
const simpleWordMap = {
  hi: {
    "the": "द",
    "a": "एक",
    "is": "है",
    "and": "और",
    "of": "का",
    "to": "को",
    "in": "में",
    "you": "आप",
    "for": "के लिए",
    "on": "पर",
    "with": "साथ",
    "are": "हैं",
    "this": "यह",
    "that": "वह",
    "from": "से",
    "day": "दिन",
    "time": "समय",
    "subject": "विषय",
    "topic": "टॉपिक",
    "add": "जोड़ें",
    "edit": "संपादित",
    "delete": "हटाएं",
    "cancel": "रद्द",
    "confirm": "पुष्टि",
    "next": "आगे",
    "previous": "पिछला",
    "profile": "प्रोफाइल",
    "logout": "लॉगआउट"
  }
  // Add similar mappings for other languages if needed
};

// Simple fallback translation when API fails
const simpleTranslate = (text, targetLang) => {
  // Only attempt simple translation if we have a word map for this language
  if (!simpleWordMap[targetLang]) return text;
  
  // Split text into words and translate each word if available in the map
  const words = text.split(/\b/); // Split by word boundary
  const translated = words.map(word => {
    const lowerWord = word.toLowerCase();
    return simpleWordMap[targetLang][lowerWord] || word;
  });
  
  return translated.join('');
};

/**
 * Translate text using Google Translate API
 * Implementation based on vitalets/google-translate-api
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} - Translated text
 */
const googleTranslate = async (text, targetLang) => {
  try {
    // Use URL with appropriate parameters
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'en',
      tl: targetLang,
      dt: 't',
      q: text,
    });
    
    const url = `${GOOGLE_TRANSLATE_API}?${params.toString()}`;
    
    // Request with appropriate headers to mimic browser behavior
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
      timeout: 5000,
    });
    
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }
    
    // Parse response
    const data = await response.json();
    
    // Google's response format is nested arrays with translations in data[0][0][0]
    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      // Extract all translation parts and join them
      const translationParts = data[0]
        .filter(item => item && item[0])
        .map(item => item[0]);
      
      return translationParts.join('');
    }
    
    throw new Error('Invalid response format from Google Translate API');
  } catch (error) {
    console.error('Google Translate error:', error);
    throw error;
  }
};

export const translateText = async (text, targetLang) => {
  console.log(`Translating "${text}" to ${targetLang}`);
  
  // If target language is English, return the original text
  if (targetLang === 'en') {
    return text;
  }

  try {
    // Check cache first
    const cache = await getCachedTranslations();
    if (cache?.[targetLang]?.[text]) {
      console.log("Using cached translation");
      return cache[targetLang][text];
    }

    // Check mock translations - prioritize these for reliability
    if (mockTranslations[targetLang]?.[text]) {
      console.log("Using mock translation");
      const mockTranslation = mockTranslations[targetLang][text];
      
      // Cache the result
      if (!cache[targetLang]) cache[targetLang] = {};
      cache[targetLang][text] = mockTranslation;
      await saveCachedTranslations(cache);
      
      return mockTranslation;
    }
    
    // Try offline translation next - prefer this over network requests for short texts
    const offlineTranslation = translateOffline(text, targetLang);
    const translationQuality = getOfflineTranslationQuality(text, targetLang);
    
    // If offline translation is high quality (>50%), use it immediately
    if (offlineTranslation !== text && translationQuality > 0.5) {
      console.log("Using high-quality offline translation");
      
      // Cache the offline translation too
      if (!cache[targetLang]) cache[targetLang] = {};
      cache[targetLang][text] = offlineTranslation;
      await saveCachedTranslations(cache);
      
      return offlineTranslation;
    }

    // If we're already in offline mode, use whatever offline translation we have
    if (isOfflineMode) {
      console.log("Device is offline, using offline translation");
      
      // Cache the result even if it's low quality
      if (offlineTranslation !== text) {
        if (!cache[targetLang]) cache[targetLang] = {};
        cache[targetLang][text] = offlineTranslation;
        await saveCachedTranslations(cache);
      }
      
      return offlineTranslation || text;
    }

    // Check network status
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      isOfflineMode = true;
      console.log("Device is offline, using offline translation");
      
      return offlineTranslation || text;
    }

    // Map language code if needed for API
    const apiLangCode = LANGUAGE_CODE_MAPPING[targetLang] || targetLang;

    try {
      // Use Google Translate API
      console.log(`Using Google Translate API for "${text}" to ${apiLangCode}`);
      const translatedText = await googleTranslate(text, apiLangCode);
      
      console.log(`Google Translation result: "${translatedText}"`);

      // Cache the result
      if (!cache[targetLang]) cache[targetLang] = {};
      cache[targetLang][text] = translatedText;
      await saveCachedTranslations(cache);

      return translatedText;
    } catch (apiError) {
      console.error("Google translation error:", apiError);
      
      // Try a backup approach - we can implement multiple backup services here
      try {
        // For now, we'll just return the offline translation
        console.log("Falling back to offline translation after API failure");
        return offlineTranslation || text;
      } catch (backupError) {
        console.error("Backup translation error:", backupError);
        return offlineTranslation || text;
      }
    }
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text if all translation attempts fail
    return text;
  }
};

// Synchronous translation - always uses offline method
export const translateTextSync = (text, targetLang) => {
  if (!text || typeof text !== 'string' || targetLang === 'en') {
    return text;
  }
  
  // Try mock translations first
  if (mockTranslations[targetLang]?.[text]) {
    return mockTranslations[targetLang][text];
  }
  
  // Fall back to offline dictionary-based translation
  return translateOffline(text, targetLang) || text;
};
