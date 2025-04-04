# Adding Translations to New Pages

This guide explains how to add translations to new pages or components that you create in the future.

## Option 1: Using the Template

The easiest way to start a new page with translation support is to use the provided template:

1. Copy the template file: `templates/NewPageTemplate.jsx`
2. Paste it to your desired location
3. Rename the file and component name
4. Modify the content as needed

The template already includes all necessary imports and integration with the translation system.

## Option 2: Using the Translation Helper Script

If you've already created a component without translations, you can use the helper script to apply translations automatically:

```bash
node scripts/apply-translations.js path/to/your/component.jsx
```

This script will:
1. Add the necessary imports for translation
2. Modify the component to receive the translation props
3. Apply the `withTranslation` HOC
4. Suggest replacements for Text components

Note: You'll still need to manually replace `<Text>` components with `<TranslatedText>` based on the suggestions.

## Option 3: Manual Integration

If you prefer to manually add translations, follow these steps:

1. Add the necessary imports:
```jsx
import TranslatedText from '../components/translated';
import withTranslation from '../components/withTranslation';
import useAppTranslation from '../utils/useAppTranslation';
```

2. Add the translation prop to your component:
```jsx
const MyComponent = ({ translation }) => {
  // Component code
};
```

3. Use the `TranslatedText` component for all text:
```jsx
// Instead of:
<Text>Hello world</Text>

// Use:
<TranslatedText text="Hello world" />
```

4. For dynamic text, use the `useAppTranslation` hook:
```jsx
const { translate, translateObject } = useAppTranslation();

// For dynamic translations like alerts:
translate("Error").then(title => 
  translate("An error occurred").then(message => 
    Alert.alert(title, message)
  )
);

// For translating entire objects:
const translatedData = await translateObject(apiResponse);
```

5. Wrap your component with the `withTranslation` HOC:
```jsx
export default withTranslation(MyComponent);
```

## Adding New Translations

To ensure offline support for common UI elements, add translations to the `mockTranslations` object in `utils/translation.js`:

```js
// In utils/translation.js
const mockTranslations = {
  hi: {
    "Your New String": "आपकी नई स्ट्रिंग",
    // Add more Hindi translations
  },
  bn: {
    "Your New String": "আপনার নতুন স্ট্রিং",
    // Add more Bengali translations
  },
  // Add for other languages...
};
```

For more advanced usage, refer to the complete [Translation System Guide](./TranslationGuide.md).

## Best Practices

1. **Use Text Constants**: Define all your text strings as constants at the top of your file or in a separate constants file for easier management.

2. **Group Related Translations**: When adding translations to `mockTranslations`, group related UI elements together with comments.

3. **Test Each Language**: After implementing translations, test your UI in each supported language to ensure proper layout and readability.

4. **Consider Text Length**: Some languages may be significantly longer than English. Design your UI to handle variable text lengths.

5. **Keep UI Text Simple**: Use simple, clear language that will translate well. Avoid idioms, slang, or complex grammatical structures.

## Troubleshooting

- If translations are not working, check that the component is properly wrapped with `withTranslation`.
- For dynamic content, ensure you're using the asynchronous translation functions correctly.
- If texts are not appearing in the correct language, check that you're using the correct language code.
- For API data, remember to translate the response using `translateObject` before using it in your UI. 