import { View, Button } from "react-native";
import { logout } from "../../utils/appwrite";
import { useRouter } from "expo-router";
import DateTimeSelector from "../../components/DateTimeSelector";
import VerticalTimePicker from "../../components/VerticalTimePicker";
import TranslatedText from "../../components/TranslatedText";

export default function TabsHome() {
  const router = useRouter()
  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)")
  }
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TranslatedText 
        text="Welcome to the Padhai App!" 
        style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}
      />
      <TranslatedText
        text="Your personal learning assistant"
        style={{ fontSize: 14, color: '#666', marginBottom: 30 }}
      />
      <Button 
        title="Logout" 
        onPress={handleLogout} 
        className="bg-white"
      />
      {/* <DateTimeSelector mode="date"/> */}
      {/* <VerticalTimePicker/> */}
    </View>
  );
}
