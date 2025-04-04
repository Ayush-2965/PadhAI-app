import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { signUp, loginWithGoogle } from "../../utils/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
const SignupScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const handleSignup = async () => {
    if (password !== confirmPassword) {
      return Alert.alert("Passwords do not match");
    }

    try {
      const response = await signUp(email, password);

      if (response.success) {
        Alert.alert("Success", response.message);
        router.replace("/(auth)/login"); // Redirect to login page
      } else {
        Alert.alert("Signup Failed", response.message);
        if (response.message.includes("User already exists")) {
          router.replace("/(auth)/login"); // Redirect if user exists
        }
      }
    } catch (error) {
      Alert.alert("Signup Failed", error.message || "Something went wrong!");
    }

  };

  const handleGoogleSignup = async () => {
    try {
      const res = await loginWithGoogle("google");
      if (res.success) {

        router.replace("/(tabs)"); // Redirect after signup/login
      }
    } catch (error) {
      Alert.alert("Google Signup Failed", error.message || "Try again!");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={require('../../assets/images/logo.png')} />
        <Text className="text-[24px] font-semibold mb-5 flex justify-start w-full">Create Your Account</Text>

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
        <TouchableOpacity className="bg-[#5C1A54] py-3 px-6 rounded-lg w-full mt-5" onPress={handleSignup}>
          <Text className="text-white text-center text-[18px]">Sign Up</Text>
        </TouchableOpacity>

        <View className="flex-row gap-3 items-center h-max my-5">
          <View className="h-[1px] bg-black w-7"></View>
          <Text style={styles.orText} className="font-light">or signup with</Text>
          <View className="h-[1px] bg-black w-7"></View>
        </View>

        <TouchableOpacity className="bg-white py-3 px-6 rounded-lg w-full mt-1 flex-row gap-4 justify-center border-[1px] border-[#ccc]" onPress={handleGoogleSignup}>
          <Image source={require("../../assets/images/google.png")} />
          <Text className="text-center text-[#3e3e3ee9]">Login with Google</Text>
        </TouchableOpacity>
        <Text style={styles.loginText} onPress={() => router.replace("/(auth)/login")}>
          Already have an account? <Text className="text-[#5C1A54]">Login</Text>
        </Text>
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
