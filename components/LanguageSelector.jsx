import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'expo-router';

/**
 * LanguageSelector component for changing the app language
 * 
 * @param {object} props
 * @param {string} props.style - Style for the container
 */
const LanguageSelector = ({ style }) => {
  const { language, changeLanguage } = useLanguage();
  const router = useRouter();
  const languages = [
    { code: 'en', name: 'English', symbol: 'A' },
    { code: 'hi', name: 'हिंदी', symbol: 'क' },
    { code: 'bn', name: 'বাংলা', symbol: 'ব' },
    { code: 'kn', name: 'ಕನ್ನಡ', symbol: 'ಠ' },
    { code: 'ta', name: 'தமிழ்', symbol: 'கு' },
    { code: 'pa', name: 'ਗੁਰਮੁਖੀ', symbol: 'ਗ' },
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.gridContainer}>
        {languages.map((lang, index) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.languageCard}
            onPress={() => {
              changeLanguage(lang.code);
              router.replace('/');
            }}
          >
            <Text style={styles.symbolText}>{lang.symbol}</Text>
            <Text style={styles.languageName}>{lang.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  languageCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbolText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#42154F',
    marginBottom: 8,
  },
  languageName: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
});

export default LanguageSelector; 