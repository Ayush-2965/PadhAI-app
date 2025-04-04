import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator } from 'react-native';
import TranslatedText from './translated';
import useAppTranslation from '../utils/useAppTranslation';

/**
 * Example component demonstrating different ways to use the translation system
 */
const TranslationExample = () => {
  const [dynamicData, setDynamicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { translate, translateObject, currentLanguage } = useAppTranslation();

  // Example of translating an entire data object
  useEffect(() => {
    const loadTranslatedData = async () => {
      setLoading(true);
      
      // Simulate API response or dynamic data
      const mockData = {
        title: "Latest Updates",
        description: "Check out what's new in our application",
        items: [
          {
            id: 1,
            title: "New Feature Added",
            description: "We've added a new feature to enhance your experience"
          },
          {
            id: 2,
            title: "Performance Improvements",
            description: "The app now runs faster than ever before"
          }
        ],
        footer: "Thanks for using our app!"
      };
      
      // Translate the entire object
      const translated = await translateObject(mockData);
      setDynamicData(translated);
      setLoading(false);
    };
    
    loadTranslatedData();
  }, [currentLanguage]); // Re-translate when language changes

  // Handle a dynamic translation on demand
  const handleDynamicTranslation = async () => {
    setLoading(true);
    
    // Example of dynamic text that needs translation
    const message = "This text was translated dynamically at " + new Date().toLocaleTimeString();
    
    // Translate and update the state
    const result = await translate(message);
    
    // Update the data object with the new translated message
    setDynamicData(prev => ({
      ...prev,
      dynamicMessage: result
    }));
    
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Static text using TranslatedText component */}
      <TranslatedText 
        text="Translation Example" 
        style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }} 
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#9333EA" />
      ) : dynamicData ? (
        <View>
          {/* Displaying translated dynamic data */}
          <TranslatedText 
            text={dynamicData.title} 
            style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }} 
          />
          
          <TranslatedText 
            text={dynamicData.description} 
            style={{ marginBottom: 15 }} 
          />
          
          {dynamicData.items.map(item => (
            <View key={item.id} style={{ marginBottom: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#9333EA' }}>
              <TranslatedText text={item.title} style={{ fontWeight: 'bold' }} />
              <TranslatedText text={item.description} />
            </View>
          ))}
          
          {dynamicData.dynamicMessage && (
            <View style={{ marginTop: 15, padding: 10, backgroundColor: '#f3e8ff' }}>
              <TranslatedText text={dynamicData.dynamicMessage} />
            </View>
          )}
          
          <TranslatedText 
            text={dynamicData.footer} 
            style={{ marginTop: 20, fontStyle: 'italic', textAlign: 'center' }} 
          />
        </View>
      ) : null}
      
      <Button 
        title="Translate Dynamic Text"
        onPress={handleDynamicTranslation}
        disabled={loading || !dynamicData}
      />
    </View>
  );
};

export default TranslationExample; 