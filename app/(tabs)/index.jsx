import React, { useCallback } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import DateTimeSelector from "../../components/DateTimeSelector";
import VerticalTimePicker from "../../components/VerticalTimePicker";
import AppText from "../../components/AppText";

function TabsHome() {
  console.log('TabsHome: Rendering');
  const router = useRouter();
  
  // Memoize navigation handler
  const handleChangeLanguage = useCallback(() => {
    console.log('TabsHome: Navigating to language selector');
    router.push("/language");
  }, [router]);
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>
        Welcome to the Tabs Screen!
      </Text>
      
      <TouchableOpacity
        className="bg-purple-900 py-3 px-6 rounded-xl shadow-lg"
        onPress={handleChangeLanguage}
      >
        <Text className="text-white text-lg font-bold">
          Change Language
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Export without translation wrapper
export default TabsHome;
