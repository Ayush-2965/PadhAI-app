import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { signUp, loginWithGoogle } from "../../utils/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import TranslatedText from '../../components/TranslatedText';
import { translateText } from '../../utils/i18n';
import { useLanguage } from '../../context/LanguageContext';

const SignupScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { language } = useLanguage();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      const errorMsg = await translateText("Passwords do not match", language);
      return Alert.alert(errorMsg);
    }

    try {
      const response = await signUp(email, password);

      if (response.success) {
        const successTitle = await translateText("Success", language);
        const successMsg = await translateText(response.message, language);
        Alert.alert(successTitle, successMsg);
        router.replace("/(auth)/login"); // Redirect to login page
      } else {
        const errorTitle = await translateText("Signup Failed", language);
        const errorMsg = await translateText(response.message, language);
        Alert.alert(errorTitle, errorMsg);
        if (response.message.includes("User already exists")) {
          router.replace("/(auth)/login"); // Redirect if user exists
        }
      }
    } catch (error) {
      const errorTitle = await translateText("Signup Failed", language);
      const errorMsg = await translateText(error.message || "Something went wrong!", language);
      Alert.alert(errorTitle, errorMsg);
    }
  };

  const handleGoogleSignup = async () => {
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
          text="Create Your Account" 
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

        {/*  Confirm Password Input */}
        <TextInput
          style={styles.input}
          className="placeholder:color-[#16153355]"
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Signup Button */}
        <TouchableOpacity 
          className="bg-[#5C1A54] py-3 px-6 rounded-lg w-full mt-5" 
          onPress={handleSignup}
        >
          <TranslatedText 
            text="Sign Up" 
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

        <TouchableOpacity 
          className="bg-white py-3 px-6 rounded-lg w-full mt-1 flex-row gap-4 justify-center border-[1px] border-[#ccc]" 
          onPress={handleGoogleSignup}
        >
          <Image source={require("../../assets/images/google.png")} />
          <TranslatedText 
            text="Login with Google" 
            className="text-center text-[#3e3e3ee9]" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <TranslatedText 
            text="Already have an account? Login" 
            style={styles.loginText} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 60,
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
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
    fontWeight: 300,
  },
  orText: {
    fontSize: 13,
    verticalAlign: "center",
    height: "max"
  },
  loginText: {
    marginTop: 35,
    textDecorationLine: "underline",
  },
});
