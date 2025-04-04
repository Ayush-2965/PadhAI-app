import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-pink-200 items-center justify-center p-5">
      {/* Logo */}
      <Image source={require("../assets/images/logo.png")} className="w-[250px] h-[90px] mb-8" resizeMode="contain" />

      {/* Message */}
      <Text className="text-xl font-bold text-purple-900 text-center mb-6">
        Language Selection Removed
      </Text>
      
      <Text className="text-base text-purple-900 text-center mb-10">
        The app now uses English only for all interfaces.
        Translation features have been removed for simplicity.
      </Text>

      {/* Go to App Button */}
      <TouchableOpacity 
        className="bg-purple-900 py-5 w-4/5 rounded-xl shadow-lg" 
        onPress={() => router.push("(tabs)")}
      >
        <Text className="text-white text-xl font-bold text-center">Continue to App</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;