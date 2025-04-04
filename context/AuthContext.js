import React, { createContext, useState, useEffect } from "react";
import { getCurrentUser, getSession } from "../utils/appwrite";
import { useFonts } from "expo-font";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(null); // Start as `null`
  const [isLoading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    "Poppins-300": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-400": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-500": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-600": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-700": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-800": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "SF-400": require("../assets/fonts/SF-Pro-Display-Regular.ttf"),
    "SF-700": require("../assets/fonts/SF-Pro-Display-Bold.ttf"),
});

  useEffect(() => {
    async function checkAuth() {
      const acc = await getCurrentUser();
      setAuthenticated(!!acc); // `true` if user exists, otherwise `false`
      setLoading(false);
    }
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
