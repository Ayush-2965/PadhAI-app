import {  Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    
      <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="community" options={{ title: "Community" }} />
      <Tabs.Screen name="createVideo" options={{ title: "Create Video" }} />
      <Tabs.Screen name="videos" options={{ title: "Reels" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    
  );
}
