import { View, Text, Button } from "react-native";
import { logout } from "../../utils/appwrite";
import { useRouter } from "expo-router";
import DateTimeSelector from "../../components/DateTimeSelector";
import VerticalTimePicker from "../../components/VerticalTimePicker";

export default function TabsHome() {
  const router =useRouter()
  const handleLogout=async ()=>{
    await logout();
    router.replace("/(auth)")
  }
  return (
    
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text >Welcome to the Tabs Screen!</Text>
        <Button title="Logout" onPress={handleLogout} className="bg-white"></Button>
        {/* <DateTimeSelector mode="date"/> */}
        {/* <VerticalTimePicker/> */}
      </View>
    
  );
}
