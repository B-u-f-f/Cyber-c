import { supportedLanguages } from '../constants/languages';

/**
 * Get the browser's preferred language or default to English
 * @returns {string} Language code (e.g., 'en', 'hi')
 */
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0]; // Get the primary language code
  
  // Check if the browser language is in our supported languages
  if (supportedLanguages.some(lang => lang.code === langCode)) {
    return langCode;
  }
  
  // Default to English
  return 'en';
};

/**
 * Get appropriate Speech Recognition language code
 * @param {string} languageCode - Basic language code (e.g., 'en', 'hi')
 * @returns {string} Full language code for speech recognition
 */
export const getSpeechRecognitionLanguage = (languageCode) => {
  const speechLanguages = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'te': 'te-IN',
  };
  
  return speechLanguages[languageCode] || 'en-US';
};

/**
 * Check if browser supports speech recognition for given language
 * @param {string} languageCode - Language code to check
 * @returns {boolean} Whether the language is supported
 */
export const isSpeechRecognitionSupported = (languageCode) => {
  // First check if speech recognition is available at all
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return false;
  }
  
  // For now, we'll assume all our supported languages are available
  // In a production app, you might want to check more specifically
  return supportedLanguages.some(lang => lang.code === languageCode);
};

/**
 * Detect probable language of text
 * @param {string} text - Text to analyze
 * @returns {string} Most likely language code
 */
export const detectLanguage = (text) => {
  if (!text || text.trim() === '') {
    return 'en'; // Default to English for empty text
  }
  
  // This is a very simplistic language detection
  // For real applications, consider using a dedicated library
  
  // Hindi character range check (Devanagari script)
  const hindiRegex = /[\u0900-\u097F]/;
  if (hindiRegex.test(text)) {
    return 'hi';
  }
  
  // Marathi uses the same script as Hindi (Devanagari)
  // For simplicity, we'll use some common Marathi words for detection
  const marathiWords = ['आहे', 'नाही', 'मराठी', 'पुणे', 'मुंबई'];
  if (marathiWords.some(word => text.includes(word))) {
    return 'mr';
  }
  
  // Telugu character range check
  const teluguRegex = /[\u0C00-\u0C7F]/;
  if (teluguRegex.test(text)) {
    return 'te';
  }
  
  // Default to English if no other language detected
  return 'en';
};

/**
 * Format text display based on language
 * Applies language-specific formatting rules
 * @param {string} text - Text to format
 * @param {string} languageCode - Language of the text
 * @returns {string} Formatted text
 */
export const formatTextByLanguage = (text, languageCode) => {
  if (!text) return '';
  
  switch (languageCode) {
    case 'hi':
    case 'mr':
    case 'te':
      // For Indian languages, we might want to apply specific formatting
      // This is a placeholder for any special formatting needed
      return text;
    case 'en':
    default:
      // For English, standard formatting
      return text;
  }
};

/**
 * Get appropriate text direction for a language
 * @param {string} languageCode - Language code
 * @returns {string} 'rtl' for right-to-left languages, 'ltr' otherwise
 */
export const getTextDirection = (languageCode) => {
  // None of our current languages are RTL, but this is for future expansion
  const rtlLanguages = ['ar', 'he', 'ur'];
  return rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
};

/**
 * Get language name from language code
 * @param {string} languageCode - Language code
 * @returns {string} Human-readable language name
 */
export const getLanguageName = (languageCode) => {
  const language = supportedLanguages.find(lang => lang.code === languageCode);
  return language ? language.name : languageCode;
};

/**
 * Real estate keywords in multiple languages
 */
export const realEstateKeywords = {
  en: [
    "apartment", "house", "villa", "rent", "buy", "sell", "location", "neighborhood",
    "bedroom", "bathroom", "furnished", "mortgage", "loan", "property", "real estate",
    "broker", "agent", "square feet", "budget", "price", "balcony", "garage", "view"
  ],
  hi: [
    "अपार्टमेंट", "मकान", "विला", "किराया", "खरीदना", "बेचना", "स्थान", "मोहल्ला",
    "बेडरूम", "बाथरूम", "सुसज्जित", "बंधक", "ऋण", "संपत्ति", "रियल एस्टेट",
    "दलाल", "एजेंट", "वर्ग फीट", "बजट", "कीमत", "बालकनी", "गैरेज", "दृश्य"
  ],
  mr: [
    "अपार्टमेंट", "घर", "बंगला", "भाडे", "विकत घेणे", "विकणे", "स्थान", "परिसर",
    "बेडरूम", "बाथरूम", "सुसज्जित", "तारण", "कर्ज", "मालमत्ता", "रिअल इस्टेट",
    "दलाल", "एजंट", "चौरस फूट", "अंदाजपत्रक", "किंमत", "गच्ची", "गॅरेज", "दृश्य"
  ],
  te: [
    "అపార్ట్మెంట్", "ఇల్లు", "విల్లా", "అద్దె", "కొనుగోలు", "అమ్మకం", "ప్రదేశం", "పరిసరాలు",
    "పడకగది", "స్నానాలగది", "సజ్జితమైన", "తాకట్టు", "రుణం", "ఆస్తి", "రియల్ ఎస్టేట్",
    "బ్రోకర్", "ఏజెంట్", "చదరపు అడుగులు", "బడ్జెట్", "ధర", "బాల్కనీ", "గ్యారేజ్", "వీక్షణ"
  ]
};

export default {
  getBrowserLanguage,
  getSpeechRecognitionLanguage,
  isSpeechRecognitionSupported,
  detectLanguage,
  formatTextByLanguage,
  getTextDirection,
  getLanguageName,
  realEstateKeywords
};