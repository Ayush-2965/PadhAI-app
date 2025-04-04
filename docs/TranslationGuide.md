# Translation System Guide

> **🌟 NEW: Google Translate Integration 🌟**
> 
> Our app now uses Google Translate API for superior translation quality:
> 
> **Benefits:**
> - **Free and Unlimited:** No API keys or usage limits
> - **Industry-Leading Accuracy:** Google's advanced neural machine translation
> - **Full Language Support:** All Indian languages fully supported 
> - **Better Performance:** Faster translations with improved caching
> - **Strong Offline Capability:** Enhanced dictionary fallback when offline

This document explains how to use the translation system in this application. The translation system is built to be easy to use while ensuring consistent language handling across the app.

## Overview

The translation system uses a combination of:
- Google Translate API for online translations
- Pre-defined translations for common UI elements
- Comprehensive offline dictionaries for offline use
- Automatic caching for performance optimization

## Using Translations in Components

### 1. TranslatedText Component (Simplest Method)

For simple text translation, use the `TranslatedText` component:

```jsx
import { TranslatedText } from '../components/translated';

// In your component render:
<TranslatedText 
  text="Hello World" 
  className="text-lg font-bold" 
  style={{ marginBottom: 10 }}
/>
```

The text will automatically be translated to the currently selected language.

### 2. useTranslator Hook (For Variables)

For translating text in variables:

```jsx
import useTranslator from '../utils/language';
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { currentLanguage } = useLanguage();
  const welcomeText = useTranslator("Welcome to the app", currentLanguage);
  
  return <Text>{welcomeText}</Text>;
}
```

### 3. useAppTranslation Hook (For Advanced Use)

For more advanced translation needs, including translating objects:

```jsx
import useAppTranslation from '../utils/useAppTranslation';

function MyComponent() {
  const { translate, translateObject, currentLanguage } = useAppTranslation();
  
  // Translate a single string asynchronously
  const [title, setTitle] = useState("");
  
  useEffect(() => {
    async function loadTranslations() {
      const translatedTitle = await translate("Welcome to the app");
      setTitle(translatedTitle);
      
      // You can also translate entire objects
      const data = {
        title: "Settings",
        items: ["Profile", "Preferences", "Logout"]
      };
      
      const translatedData = await translateObject(data);
      // Now all strings in the object are translated
    }
    
    loadTranslations();
  }, [currentLanguage]);
  
  return <Text>{title}</Text>;
}
```

### 4. withTranslation HOC (For Class Components or Complex Screens)

Wrap your component with the `withTranslation` higher-order component:

```jsx
import withTranslation from '../components/withTranslation';

function MyScreen({ translation }) {
  // translation object contains language info and other properties
  
  return (
    <View>
      <TranslatedText text="Welcome to the app" />
    </View>
  );
}

export default withTranslation(MyScreen);
```

## Adding New Languages

To add support for a new language, update the `SUPPORTED_LANGUAGES` array in `contexts/LanguageContext.js`.

## Adding New Mock Translations

For frequently used UI elements, add translations to the `mockTranslations` object in `utils/translation.js`:

```js
// In utils/translation.js
const mockTranslations = {
  hi: {
    "Welcome": "स्वागत है",
    // Add more translations
  },
  // Add more languages
};
```

## Translation Precedence

The system follows this order when translating text:

1. **Cache check:** Previously translated text is retrieved instantly
2. **Mock translations:** Predefined UI translations for consistent experience
3. **Offline dictionary:** Pattern and dictionary-based offline translations
4. **Google Translate API:** High-quality online translations
5. **Fallback mechanisms:** If everything fails, returns the original text

## Best Practices

1. **Component Text**: Always use `TranslatedText` for any user-facing text
2. **Dynamic Content**: Use `useTranslator` for variables that need translation
3. **Complex Data**: Use `useAppTranslation` for translating objects or arrays
4. **Performance**: Add frequently used strings to the `mockTranslations` object
5. **Testing**: Test your UI in different languages to ensure proper layout

## Technical Details

- Translations are cached using `expo-secure-store`
- The system automatically detects offline status and uses appropriate translation method
- The current language is stored in secure storage for persistence between app launches 