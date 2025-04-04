import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import "./globals.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('RootLayout: Initializing...');
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'SF-Pro-Regular': require('../assets/fonts/SF-Pro-Display-Regular.ttf'),
    'SF-Pro-Bold': require('../assets/fonts/SF-Pro-Display-Bold.ttf'),
  });

  const prepareApp = useCallback(async () => {
    try {
      console.log('RootLayout: Preparing app...');
      setAppReady(true);
      console.log('RootLayout: App preparation complete');
    } catch (error) {
      console.error('RootLayout: Initialization error:', error);
    }
  }, []);

  useEffect(() => {
    console.log('RootLayout: Running initial effect...');
    prepareApp();
  }, [prepareApp]);

  const onLayoutRootView = useCallback(async () => {
    console.log('RootLayout: Layout root view callback...');
    if (fontsLoaded && appReady) {
      console.log('RootLayout: Hiding splash screen...');
      await SplashScreen.hideAsync();
      console.log('RootLayout: Splash screen hidden');
    }
  }, [fontsLoaded, appReady]);

  if (!fontsLoaded || !appReady) {
    console.log('RootLayout: Still loading...', { fontsLoaded, appReady });
    return null;
  }

  console.log('RootLayout: Rendering main layout');
  return (
    <LanguageProvider>
      <AuthProvider>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="language" />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}