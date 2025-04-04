import { Tabs } from "expo-router";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: (props) => <CustomTabButton {...props} route={route} />,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#ddd",
          height: 60,
          paddingBottom: 5,
        },
        tabBarBackground: () => <View style={{ backgroundColor: "#F1BED1", flex: 1 }} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="videos" options={{ title: "Reels" }} />
      <Tabs.Screen name="createVideo" options={{ title: "Create" }} />
      <Tabs.Screen name="(community)" options={{ title: "Community" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

function CustomTabButton({ route, accessibilityState, onPress }) {
  const isFocused = accessibilityState.selected;

  // Custom styles for each tab
  const tabStyles = {
    index: { iconSize: isFocused ? 28 : 24, iconColor: isFocused ? "#C46287" : "#AA7589" },
    "(community)": { iconSize: isFocused ? 28 : 24, iconColor: isFocused ? "#C46287" : "#AA7589" },
    createVideo: {
      iconSize: isFocused ? 28 : 24, 
      bg: "#C46287",
      iconColor: "white",
      borderWidth: 3,
      borderColor: "white",
    }, 
    videos: { iconSize: isFocused ? 28 : 24, iconColor: isFocused ? "#C46287" : "#AA7589" },
    profile: { iconSize: isFocused ? 28 : 24, iconColor: isFocused ? "#C46287" : "#AA7589" },
  };

  // Icons mapping
  const getTabIcon = (routeName, iconSize, iconColor) => {
    switch (routeName) {
      case "(community)":
        return <MaterialCommunityIcons name="message-bulleted" size={iconSize} color={iconColor} />;
      case "index":
        return <Entypo name="home" size={iconSize} color={iconColor} />;
      case "videos":
        return <Entypo name="folder-video" size={iconSize} color={iconColor} />;
      case "profile":
        return <Ionicons name="person" size={iconSize} color={iconColor} />;
      case "createVideo":
        return <Entypo name="modern-mic" size={iconSize} color={iconColor} />;
      default:
        return <MaterialCommunityIcons name="help-outline" size={iconSize} color={iconColor} />;
    }
  };

  const { bg, iconColor, borderWidth, borderColor, iconSize } = tabStyles[route.name] || {
    bg: "white",
    iconColor: "gray",
    borderWidth: 0,
    borderColor: "transparent",
    iconSize: 24,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        borderRadius: route.name === "createVideo" ? 100 : 10, // Round for Create Video
        marginVertical: route.name === "createVideo" ? -2 : 5, // Raised effect
        marginHorizontal: 5,
        paddingVertical: route.name === "createVideo" ? 15 : 8, // Larger touch area
        width: route.name === "createVideo" ? 60 : undefined,
        height: route.name === "createVideo" ? 60 : undefined,
        borderWidth,
        borderColor,
        top: route.name === "createVideo" ? -20 : 0, // Floating effect
      }}
    >
      {getTabIcon(route.name, iconSize, iconColor)}
    </TouchableOpacity>
  );
}
