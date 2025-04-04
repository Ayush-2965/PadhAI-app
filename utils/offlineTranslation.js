/**
 * Comprehensive offline translation engine
 * Provides translation capabilities without requiring network access
 */

// Dictionary-based translation for common words and phrases
const dictionaryData = {
  hi: {
    // Common words
    "the": "द",
    "a": "एक",
    "is": "है",
    "are": "हैं",
    "and": "और",
    "or": "या",
    "of": "का",
    "to": "को",
    "in": "में",
    "for": "के लिए",
    "with": "साथ",
    "without": "बिना",
    "not": "नहीं",
    "this": "यह",
    "that": "वह",
    "these": "ये",
    "those": "वे",
    "here": "यहां",
    "there": "वहां",
    "where": "कहां",
    "when": "कब",
    "how": "कैसे",
    "why": "क्यों",
    "what": "क्या",
    "who": "कौन",
    "which": "कौन-सा",
    "all": "सभी",
    "some": "कुछ",
    "many": "कई",
    "few": "कुछ",
    "one": "एक",
    "two": "दो",
    "three": "तीन",
    "four": "चार",
    "five": "पांच",
    
    // App-specific terms
    "subject": "विषय",
    "topic": "टॉपिक",
    "language": "भाषा",
    "profile": "प्रोफाइल",
    "settings": "सेटिंग्स",
    "notifications": "सूचनाएं",
    "dashboard": "डैशबोर्ड",
    "study": "अध्ययन",
    "plan": "योजना",
    "session": "सत्र",
    "time": "समय",
    "day": "दिन",
    "week": "सप्ताह",
    "month": "महीना",
    "year": "वर्ष",
    "slot": "स्लॉट",
    
    // UI actions
    "add": "जोड़ें",
    "edit": "संपादित करें",
    "delete": "हटाएं",
    "remove": "निकालें",
    "save": "सहेजें",
    "cancel": "रद्द करें",
    "confirm": "पुष्टि करें",
    "update": "अपडेट करें",
    "create": "बनाएं",
    "search": "खोजें",
    "filter": "फ़िल्टर करें",
    "sort": "क्रमबद्ध करें",
    "login": "लॉगिन करें",
    "logout": "लॉगआउट करें",
    "signup": "साइन अप करें",
    "submit": "जमा करें",
    "next": "अगला",
    "previous": "पिछला",
    "back": "वापस",
    "continue": "जारी रखें",
  },
  
  bn: {
    // Common words
    "the": "দি",
    "a": "একটি",
    "is": "হয়",
    "are": "হন",
    "and": "এবং",
    "or": "বা",
    "of": "এর",
    "to": "কে",
    "in": "মধ্যে",
    "for": "জন্য",
    "with": "সাথে",
    "without": "ছাড়া",
    "not": "না",
    "this": "এই",
    "that": "ওই",
    "these": "এইগুলি",
    "those": "ওইগুলি",
    
    // App-specific terms
    "subject": "বিষয়",
    "topic": "টপিক",
    "language": "ভাষা",
    "profile": "প্রোফাইল",
    "study": "অধ্যয়ন",
    "plan": "পরিকল্পনা",
    "session": "সেশন",
    "slot": "স্লট",
    
    // UI actions
    "add": "যোগ করুন",
    "edit": "সম্পাদনা করুন",
    "delete": "মুছুন",
    "save": "সংরক্ষণ করুন",
    "cancel": "বাতিল করুন",
    "next": "পরবর্তী",
    "previous": "আগের",
  },
  
  // Add similar dictionaries for other languages
  ta: {
    "subject": "பாடம்",
    "topic": "தலைப்பு",
    "slot": "ஸ்லாட்",
    "add": "சேர்க்க",
    "next": "அடுத்து",
    "previous": "முந்தைய"
  },
  
  te: {
    "subject": "విషయం",
    "slot": "స్లాట్",
    "add": "జోడించు",
    "next": "తరువాత"
  },
  
  kn: {
    "subject": "ವಿಷಯ",
    "slot": "ಸ್ಲಾಟ್",
    "add": "ಸೇರಿಸಿ",
    "next": "ಮುಂದೆ"
  },
  
  gu: {
    "subject": "વિષય",
    "slot": "સ્લોટ",
    "add": "ઉમેરો",
    "next": "આગળ"
  },
  
  pa: {
    "subject": "ਵਿਸ਼ਾ",
    "slot": "ਸਲਾਟ",
    "add": "ਜੋੜੋ",
    "next": "ਅੱਗੇ"
  }
};

// Pattern-based translation rules for handling common phrases and patterns
const translationPatterns = {
  hi: [
    // Number + noun patterns
    { pattern: /(\d+) slots?/g, replacement: (_, num) => `${num} स्लॉट` },
    { pattern: /(\d+) subjects?/g, replacement: (_, num) => `${num} विषय` },
    { pattern: /(\d+) topics?/g, replacement: (_, num) => `${num} टॉपिक्स` },
    { pattern: /(\d+) hours?/g, replacement: (_, num) => `${num} घंटे` },
    { pattern: /(\d+) days?/g, replacement: (_, num) => `${num} दिन` },
    
    // Common phrases
    { pattern: /Add new/g, replacement: () => "नया जोड़ें" },
    { pattern: /Save changes/g, replacement: () => "परिवर्तन सहेजें" },
    { pattern: /No results found/g, replacement: () => "कोई परिणाम नहीं मिला" },
    { pattern: /Slot (\d+)/g, replacement: (_, num) => `स्लॉट ${num}` },
  ],
  
  bn: [
    // Number patterns
    { pattern: /(\d+) slots?/g, replacement: (_, num) => `${num} স্লট` },
    { pattern: /(\d+) subjects?/g, replacement: (_, num) => `${num} বিষয়` },
    { pattern: /Slot (\d+)/g, replacement: (_, num) => `স্লট ${num}` },
  ],
  
  // Add patterns for other languages as needed
};

/**
 * Translate text using dictionary-based approach
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {string} - Translated text
 */
export const translateOffline = (text, targetLang) => {
  if (!text || typeof text !== 'string' || targetLang === 'en') {
    return text;
  }
  
  // Get language dictionary
  const dictionary = dictionaryData[targetLang];
  if (!dictionary) {
    return text; // No dictionary for this language
  }
  
  // First, try pattern-based replacements 
  let translatedText = text;
  const patterns = translationPatterns[targetLang] || [];
  
  patterns.forEach(({ pattern, replacement }) => {
    translatedText = translatedText.replace(pattern, replacement);
  });
  
  // If pattern-based translation significantly changed the text, return it
  if (translatedText !== text && translatedText.length > text.length * 0.5) {
    return translatedText;
  }
  
  // Otherwise, use word-by-word translation
  const words = text.split(/\b/);
  const translatedWords = words.map(word => {
    // Try lowercase match first
    const lowerWord = word.toLowerCase();
    if (dictionary[lowerWord]) {
      // Preserve capitalization
      if (word[0] === word[0].toUpperCase()) {
        const translated = dictionary[lowerWord];
        return translated.charAt(0).toUpperCase() + translated.slice(1);
      }
      return dictionary[lowerWord];
    }
    
    // Try exact match
    if (dictionary[word]) {
      return dictionary[word];
    }
    
    // No translation found
    return word;
  });
  
  return translatedWords.join('');
};

/**
 * Analyze how good an offline translation is likely to be
 * @param {string} text - Text to analyze
 * @param {string} targetLang - Target language code
 * @returns {number} - Quality score from 0-1
 */
export const getOfflineTranslationQuality = (text, targetLang) => {
  if (!text || typeof text !== 'string' || targetLang === 'en') {
    return 1; // No translation needed
  }
  
  const dictionary = dictionaryData[targetLang];
  if (!dictionary) {
    return 0; // No dictionary available
  }
  
  // Count how many words we can translate
  const words = text.split(/\b/).filter(word => word.trim() !== '');
  let translatable = 0;
  
  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    if (dictionary[lowerWord] || dictionary[word]) {
      translatable++;
    }
  });
  
  // Also check if any patterns match
  const patterns = translationPatterns[targetLang] || [];
  for (const { pattern } of patterns) {
    if (pattern.test(text)) {
      translatable += 2; // Patterns count more
    }
  }
  
  // Calculate quality score
  return Math.min(1, translatable / (words.length || 1));
};

export default {
  translateOffline,
  getOfflineTranslationQuality,
  dictionaryData,
  translationPatterns
}; 