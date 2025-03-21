import { router, Slot, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getCurrentUser, getSession } from "../utils/appwrite"; // Function to check session
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
    const [isLoading, setLoading] = useState(true);
    const [isAuthenticated, setAuthenticated] = useState(false);
const router=useRouter();
    useEffect(() => {
        async function checkAuth() {
            const session = await getSession();
            const acc= await getCurrentUser();
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
            if (isAuthenticated) {
                router.replace("/(tabs)"); // Redirect logged-in users to tabs
            } else {
                router.replace("/");
            }
        }
    }, [isLoading, isAuthenticated]);
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
       
        <Slot/>
    );
}
