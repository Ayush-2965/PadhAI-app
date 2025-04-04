import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { getCurrentUser } from "../utils/appwrite";
import * as SplashScreen from "expo-splash-screen";
import SplashAnimation from "../components/SplashAnimation"; // Custom animated splash screen

SplashScreen.preventAutoHideAsync(); // Prevent splash from auto-hiding

export default function Index() {
  const [isLoading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAppStatus() {
      const seenOnboarding = await SecureStore.getItemAsync("hasSeenOnboarding");
      const user = await getCurrentUser();

      setHasSeenOnboarding(!!seenOnboarding);
      setAuthenticated(!!user);
      setLoading(false);
    }

    checkAppStatus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(async () => {
        await SplashScreen.hideAsync(); // Hide splash after animation
        if (!hasSeenOnboarding) {
          router.replace("/onboarding");
        } else if (isAuthenticated) {
          router.replace("/language");
        } else {
          router.replace("(auth)");
        }
      }, 2000); // Add delay for animation effect
    }
  }, [isLoading, hasSeenOnboarding, isAuthenticated]);

  return <SplashAnimation />; // Show animated splash screen while loading
}
