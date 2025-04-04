import React, { useState, useEffect, useCallback, memo } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { useLanguage, SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";
import useTranslator from "../utils/language";

SplashScreen.preventAutoHideAsync();

// Memoized language button component to prevent unnecessary re-rendering
const LanguageButton = memo(({ lang, selectedLang, onPress }) => {
  return (
    <TouchableOpacity
      className={`w-32 h-32 m-2 flex items-center justify-center rounded-xl shadow-md ${
        selectedLang === lang.code ? "bg-pink-400" : "bg-pink-300"
      }`}
      onPress={() => onPress(lang)}
    >
      <Text className="text-3xl font-bold text-purple-900">{lang.symbol}</Text>
      <Text className="text-lg font-normal text-purple-900 mt-1">{lang.name}</Text>
    </TouchableOpacity>
  );
});

const Index = () => {
  console.log('Language Selector: Initializing...');
  const [selectedLang, setSelectedLang] = useState(null);
  const router = useRouter();
  const { changeLanguage, currentLanguage } = useLanguage();
  
  // Default to current language if available (only once on mount)
  useEffect(() => {
    if (currentLanguage && !selectedLang) {
      setSelectedLang(currentLanguage);
      console.log('Language Selector: Default selection set to:', currentLanguage);
    }
  }, [currentLanguage]);  // Only depend on currentLanguage

  // Memoize handlers to prevent re-creation on each render
  const handleLanguageSelect = useCallback((lang) => {
    console.log('Language Selector: Handling language selection:', lang);
    setSelectedLang(prevSelected => 
      prevSelected === lang.code ? null : lang.code
    );
  }, []);

  const handleNext = useCallback(async () => {
    if (!selectedLang) return;
    
    console.log('Language Selector: Handling next button press');
    console.log('Language Selector: Saving language:', selectedLang);
    
    try {
      await changeLanguage(selectedLang);
      console.log('Language Selector: Hiding splash screen');
      await SplashScreen.hideAsync();
      console.log('Language Selector: Navigating to tabs');
      router.push("(tabs)");
    } catch (error) {
      console.error('Language Selector: Error during navigation:', error);
    }
  }, [selectedLang, changeLanguage, router]);

  // Translate UI elements
  // Start with English as fallback
  const tempLang = selectedLang || currentLanguage || 'en';
  const chooseLanguageText = useTranslator("Choose a Language", tempLang);
  const nextButtonText = useTranslator("Next", tempLang);

  return (
    <View className="flex-1 bg-pink-200">
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingHorizontal: 20, paddingBottom: 100 }}>
        {/* Logo */}
        <Image source={require("../assets/images/logo.png")} className="w-[250px] h-[90px] mt-8" resizeMode="contain" />

        {/* Title */}
        <Text className="text-xl font-sf font-bold text-purple-900 mt-2 mb-5 text-center">{chooseLanguageText}</Text>

        {/* Language Grid */}
        <View className="flex-row flex-wrap justify-center">
          {SUPPORTED_LANGUAGES.map((lang, index) => (
            <LanguageButton 
              key={index}
              lang={lang}
              selectedLang={selectedLang}
              onPress={handleLanguageSelect}
            />
          ))}
        </View>
      </ScrollView>

      {/* Next Button (Appears only when a language is selected) */}
      {selectedLang && (
        <TouchableOpacity 
          className="bg-purple-900 py-5 w-4/5 rounded-xl absolute bottom-5 self-center shadow-lg" 
          onPress={handleNext}
        >
          <Text className="text-white text-xl font-bold text-center">{nextButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Index;