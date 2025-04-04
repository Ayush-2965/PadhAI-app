import React, { useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import DateTimeSelector from "../../components/DateTimeSelector";
import VerticalTimePicker from "../../components/VerticalTimePicker";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector";
import TranslatedText from "../../components/translated";
import withTranslation from "../../components/withTranslation";

function TabsHome({ translation }) {
  console.log('TabsHome: Rendering with language context');
  const router = useRouter();
  
  // Memoize navigation handler
  const handleChangeLanguage = useCallback(() => {
    console.log('TabsHome: Navigating to language selector');
    router.push("/language");
  }, [router]);
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      {/* Using the TranslatedText component directly */}
      <TranslatedText 
        text="Welcome to the Tabs Screen!" 
        style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }} 
      />
      
      <TouchableOpacity
        className="bg-purple-900 py-3 px-6 rounded-xl shadow-lg"
        onPress={handleChangeLanguage}
      >
        <TranslatedText 
          text="Change Language" 
          className="text-white text-lg font-bold" 
        />
      </TouchableOpacity>
    </View>
  );
}

// Export with translation wrapper
export default withTranslation(TabsHome);
