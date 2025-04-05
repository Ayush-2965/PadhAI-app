import { Stack } from "expo-router";
import React from "react";
import TranslatedText from "../../../components/TranslatedText";

export default function CommunityLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        headerTitle: ({children}) => (
          <TranslatedText text={children} style={{fontSize: 18, fontWeight: 'bold'}} />
        )
      }}
    >
      <Stack.Screen name="index" options={{ title: "Community", headerShown: false }} />
      <Stack.Screen name="forum" options={{ title: "Forum" }} />
      <Stack.Screen name="planner" options={{ title: "Planner" }} />
    </Stack>
  );
}
