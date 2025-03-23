import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getCurrentUser, getSession } from "../utils/appwrite"; // Function to check session
import { Image, Text, View } from "react-native";
import { useFonts } from "expo-font";
import { MotiView } from "moti";
import PencilIcon from "../assets/images/pencil.svg";

import "./globals.css"

export default function RootLayout() {
    const [isLoading, setLoading] = useState(true);
    const [isAuthenticated, setAuthenticated] = useState(false);
    const router = useRouter();

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
            const session = await getSession();
            const acc = await getCurrentUser();
            // console.log(acc);
            setAuthenticated(!!acc); // acc or session
            setLoading(false);
            // console.log(session);
        }
        checkAuth();
    }, []);
    // console.log(isAuthenticated);

    useEffect(() => {
        if (!isLoading) {
            if (fontsLoaded) {

                if (isAuthenticated) {
                    router.replace("/(tabs)"); // Redirect logged-in users to tabs
                } else {
                    router.replace("/");
                }
            }
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading || !fontsLoaded) {
        return (
            <View className="flex items-center justify-center h-screen bg-white">
                <MotiView
                    from={{ rotate: "-20deg" }}
                    animate={{ rotate: "20deg" }}
                    transition={{
                        type: "timing",
                        duration: 700,
                        loop: true,
                        repeatReverse: true, // Makes it oscillate back and forth
                    }}
                >
                    <PencilIcon width={100} height={100} fill="blue" style={{ transform: [{ rotate: "180deg" }] }}/>
                </MotiView>
                <Image source={require("../assets/images/padhai.png")}/>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <Stack >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerBackground: () => null, headerTransparent: true, headerShadowVisible: false, headerTitle: "" }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaProvider>
    );
}
