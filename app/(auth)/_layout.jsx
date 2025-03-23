import { useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import * as Linking from "expo-linking";

export default function Layout({ children }) {
    const router = useRouter();
    const pathname = usePathname(); // ✅ Get current route
    
    useEffect(() => {

        const handleDeepLink = ({ url }) => {
            console.log("🔗 Deep Link Opened:", url);

            try {
                const { path, queryParams } = Linking.parse(url);
                console.log("📌 Parsed Path:", path, queryParams);
                console.log("📍 Current Route:", pathname);

                // ✅ If deep link is "localhost", redirect to "/auth"
                if (path === "") {
                    console.log("🚀 Redirecting from `/localhost` to `/auth`...");
                    router.replace("/(tabs)");
                    // router.replace(`/(auth)?userId=${queryParams.userId}&secret=${queryParams.secret}`);
                }
            } catch (error) {
                console.error("❌ Deep Link Error:", error);
            }
        };

        const subscription = Linking.addEventListener("url", handleDeepLink);
        return () => subscription.remove();
    }, [pathname]);

    return (
        <>
            {children}
            <Stack screenOptions={{headerShown:false}}/>
        </>
    );
}
