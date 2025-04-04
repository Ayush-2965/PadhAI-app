import { Stack } from "expo-router";

export default function CommunityLayout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="index" options={{ title: "Community",headerShown:false }} />
      <Stack.Screen name="forum" options={{ title: "Forum" }} />
      <Stack.Screen name="planner" options={{ title: "Planner" }} />
    </Stack>
  );
}
