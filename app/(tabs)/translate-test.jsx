import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import TranslatedText from '../../components/translated';
import withTranslation from '../../components/withTranslation';
import useAppTranslation from '../../utils/useAppTranslation';
import { useLanguage } from '../../contexts/LanguageContext';

const TranslateTest = ({ translation }) => {
  const [inputText, setInputText] = useState('Hello! This is a test of the Google Translate API integration.');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(translation.language);
  const { translate } = useAppTranslation();
  const { setLanguage, currentLanguage } = useLanguage();
  
  // List of supported languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' },
    { code: 'ur', name: 'Urdu' }
  ];

  // Predefined test phrases
  const testPhrases = [
    "Welcome to our translation testing tool!",
    "Please select your preferred language from the dropdown.",
    "This app uses Google Translate API for high-quality translations.",
    "Today is a beautiful day to learn something new.",
    "What time does the class begin tomorrow?",
    "I need to prepare for my mathematics exam next week.",
    "The library has many interesting books about science.",
    "Could you help me find the nearest restaurant?",
    "Thank you for your assistance with this project.",
    "Education is the most powerful weapon which you can use to change the world."
  ];
  
  // Translate the input text when language changes or user submits
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await translate(inputText, selectedLanguage);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText(`Error: Could not translate text. ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply selected language to the entire app
  const applyLanguage = () => {
    setLanguage(selectedLanguage);
  };
  
  // Use a predefined test phrase
  const useTestPhrase = (phrase) => {
    setInputText(phrase);
  };
  
  // Clear the input and translation
  const clearText = () => {
    setInputText('');
    setTranslatedText('');
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Google Translate Test</Text>
        <Text style={styles.subtitle}>Current App Language: {currentLanguage}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Language:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
            style={styles.picker}
          >
            {languages.map(lang => (
              <Picker.Item key={lang.code} label={lang.name} value={lang.code} />
            ))}
          </Picker>
        </View>
        
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={applyLanguage}
        >
          <Text style={styles.buttonText}>Apply to Entire App</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Phrases:</Text>
        <ScrollView horizontal style={styles.phrasesContainer}>
          {testPhrases.map((phrase, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.phraseChip}
              onPress={() => useTestPhrase(phrase)}
            >
              <Text style={styles.phraseText} numberOfLines={1}>{phrase.substring(0, 20)}...</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text to Translate:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter text to translate..."
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.translateButton]}
            onPress={handleTranslate}
          >
            <Text style={styles.buttonText}>Translate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]}
            onPress={clearText}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Translation:</Text>
        <View style={styles.translationContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4299e1" />
          ) : (
            <Text style={styles.translationText}>{translatedText}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common UI Examples:</Text>
        <View style={styles.uiExamplesContainer}>
          <TranslatedText text="Welcome to our app" style={styles.exampleText} />
          <TranslatedText text="Please sign in to continue" style={styles.exampleText} />
          <TranslatedText text="Your profile settings" style={styles.exampleText} />
          <TranslatedText text="Would you like to enable notifications?" style={styles.exampleText} />
          <TranslatedText text="This app requires internet connection" style={styles.exampleText} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#334155',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  phrasesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  phraseChip: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    maxWidth: 150,
  },
  phraseText: {
    color: '#0369a1',
    fontSize: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  translateButton: {
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  translationContainer: {
    minHeight: 120,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  uiExamplesContainer: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
    paddingVertical: 4,
  },
});

export default withTranslation(TranslateTest); 