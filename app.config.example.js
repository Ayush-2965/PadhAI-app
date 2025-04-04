// Example app.config.js for configuring the translation API
// Copy this file to app.config.js and modify as needed

import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }) => ({
  ...config,
  // You can customize your slug, name and other expo config here
  
  // Custom extra values that can be accessed via Constants.expoConfig.extra
  // in your app code
  extra: {
    // Translation API configuration
    // By default, the app uses the public LibreTranslate API
    // You can change this to point to your own LibreTranslate instance
    // or another translation service that uses the same API format
    
    // OPTION 1: Public LibreTranslate API (rate limited)
    translationApiUrl: "https://libretranslate.com/translate",
    
    // OPTION 2: Self-hosted LibreTranslate instance
    // translationApiUrl: "https://your-libretranslate-instance.com/translate",
    // translationApiKey: "your-api-key-if-required",
    
    // OPTION 3: Paid service like LibreTranslate API Pro
    // translationApiUrl: "https://libretranslate.de/translate",
    // translationApiKey: "your-api-key",
    
    // Add any other app-specific configuration here
    // eas: {
    //   projectId: "your-eas-project-id"
    // },
  }
}); 