import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signUp, loginWithGoogle } from "../../utils/appwrite";

const SignupScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Handle Email & Password Signup
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      return Alert.alert("Passwords do not match");
    }

    try {
      await signUp(email, password);
      Alert.alert("Success", "Account created! Please log in.");
      router.replace("/(auth)/login"); // Redirect to login page
    } catch (error) {
      Alert.alert("Signup Failed", error.message || "Something went wrong!");
    }
  };

  // ✅ Handle Google Signup/Login
  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      router.replace("/(tabs)"); // Redirect after signup/login
    } catch (error) {
      Alert.alert("Google Signup Failed", error.message || "Try again!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* ✅ Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* ✅ Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* ✅ Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* ✅ Signup Button */}
      <Button title="Sign Up" onPress={handleSignup} />

      <Text style={styles.orText}>or</Text>

      {/* ✅ Google Signup/Login Button */}
      <Button title="Continue with Google" onPress={handleGoogleSignup} color="red" />

      <Text style={styles.loginText} onPress={() => router.replace("/(auth)/login")}>
        Already have an account? Log in
      </Text>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
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
    color: "blue",
    textDecorationLine: "underline",
  },
});
