import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import TranslatedText from '../components/translated';
import withTranslation from '../components/withTranslation';
import useAppTranslation from '../utils/useAppTranslation';

/**
 * Template for creating new pages with translation support
 * 
 * To use this template:
 * 1. Copy this file to your desired location
 * 2. Rename it and the component name
 * 3. Modify the content as needed
 * 4. All text is automatically translation-ready
 */
const NewPageTemplate = ({ translation }) => {
  // Access router for navigation
  const router = useRouter();
  
  // For accessing translation utilities directly (for alerts, dynamic content, etc.)
  const { translate, translateObject } = useAppTranslation();
  
  // Example state for dynamic content
  const [data, setData] = useState(null);
  
  // Example effect for loading and translating data
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call or data fetching
      const response = {
        title: "Page Title",
        description: "This is a description of the page content.",
        items: [
          { id: 1, label: "First Item" },
          { id: 2, label: "Second Item" },
          { id: 3, label: "Third Item" }
        ]
      };
      
      // Translate the entire response object
      const translatedData = await translateObject(response);
      setData(translatedData);
    };
    
    loadData();
  }, [translation.language]); // Re-run when language changes
  
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Static text elements - simplest translation method */}
        <TranslatedText 
          text="New Page" 
          className="text-2xl font-bold mb-4"
        />
        
        <TranslatedText 
          text="This is a template for creating new pages with translation support." 
          className="text-gray-700 mb-6"
        />
        
        {/* Dynamic translated content */}
        {data && (
          <View className="mb-6">
            <TranslatedText 
              text={data.title} 
              className="text-xl font-semibold mb-2"
            />
            
            <TranslatedText 
              text={data.description} 
              className="text-gray-600 mb-4"
            />
            
            {/* List of items */}
            {data.items.map(item => (
              <View key={item.id} className="p-3 mb-2 bg-gray-100 rounded-md">
                <TranslatedText text={item.label} />
              </View>
            ))}
          </View>
        )}
        
        {/* Example button with translation */}
        <TouchableOpacity
          className="bg-blue-500 py-3 rounded-lg items-center mt-4"
          onPress={() => router.back()}
        >
          <TranslatedText 
            text="Go Back" 
            className="text-white font-bold"
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Export with the translation wrapper
export default withTranslation(NewPageTemplate); 