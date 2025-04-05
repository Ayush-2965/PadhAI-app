import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { login, loginWithGoogle } from '../../utils/appwrite';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import TranslatedText from '../../components/TranslatedText';
import { translateText } from '../../utils/i18n';
import { useLanguage } from '../../context/LanguageContext';

const loginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { language } = useLanguage();

  const handleLogin = async () => {
    try {
      await login(email, password)
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
      const errorTitle = await translateText("Login Failed", language);
      const errorMsg = await translateText(error.message || "Error", language);
      Alert.alert(errorTitle, errorMsg);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const res = await loginWithGoogle("google");
      if (res.success) {
        router.replace("/(tabs)"); // Redirect after signup/login
      }
    } catch (error) {
      const errorTitle = await translateText("Google Signup Failed", language);
      const errorMsg = await translateText(error.message || "Try again!", language);
      Alert.alert(errorTitle, errorMsg);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={require('../../assets/images/logo.png')} />
        <TranslatedText 
          text="Login Your Account" 
          className="text-[24px] font-semibold mb-5 flex justify-start w-full" 
        />

        {/*  Email Input */}
        <TextInput
          style={styles.input}
          className="placeholder:color-[#16153355] "
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/*  Password Input */}
        <TextInput
          style={styles.input}
          className="placeholder:color-[#16153355]"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />


        {/* Signup Button */}
        <TouchableOpacity className="bg-[#5C1A54] py-3 px-6 rounded-lg w-full mt-5" onPress={handleLogin}>
          <TranslatedText 
            text="Sign In" 
            className="text-white text-center text-[18px]" 
          />
        </TouchableOpacity>

        <View className="flex-row gap-3 items-center h-max my-5">
          <View className="h-[1px] bg-black w-7"></View>
          <TranslatedText 
            text="or signup with" 
            style={styles.orText} 
            className="font-light" 
          />
          <View className="h-[1px] bg-black w-7"></View>
        </View>

        <TouchableOpacity className="bg-white py-3 px-6 rounded-lg w-full mt-1 flex-row gap-4 justify-center border-[1px] border-[#ccc]" onPress={handleGoogleLogin}>
          <Image source={require("../../assets/images/google.png")} />

        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/(auth)")}>
          <TranslatedText 
            text="Don't have an account? Signup" 
            style={styles.loginText} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default loginPage


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 60,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  orText: {
    marginVertical: 10,
    fontSize: 16,
  },
  loginText: {
    marginTop: 15,
    textDecorationLine: "underline",
  },
});
