import { View, Text, Alert, StyleSheet,Button,TextInput } from 'react-native'
import React, { useState } from 'react'
import { login,loginWithGoogle } from '../../utils/appwrite';
import { useRouter } from 'expo-router';

const loginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await login(email, password)
            router.replace("/(tabs)");
        } catch (error) {
            console.log(error);
            Alert.alert("Login Failed", error.message || "Error")
        }
    }

    const handleGoogleLogin = async () => {
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

            {/* ✅ Signup Button */}
            <Button title="Sign In" onPress={handleLogin} />

            <Text style={styles.orText}>or</Text>

            {/* ✅ Google Signup/Login Button */}
            <Button title="Continue with Google" onPress={handleGoogleLogin} color="red" />

            <Text style={styles.loginText} onPress={() => router.replace("/(auth)")}>
                Already have an account? Log in
            </Text>
        </View>
    )
}

export default loginPage


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
