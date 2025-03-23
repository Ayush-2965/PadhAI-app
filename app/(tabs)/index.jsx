import { View, Text, Button } from "react-native";
import { logout } from "../../utils/appwrite";
import { useRouter } from "expo-router";

export default function TabsHome() {
  const router =useRouter()
  const handleLogout=()=>{
    router.replace("/(auth)")
  }
  return (
    
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text >Welcome to the Tabs Screen!</Text>
        <Button title="Logout" onPress={handleLogout} className="bg-white"></Button>
      </View>
    
  );
}
