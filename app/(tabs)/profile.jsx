import { View, Button, Text } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { logout } from '../../utils/appwrite'
import AppText from '../../components/AppText'

const Profile = () => {
    const router = useRouter()
    
    const handleLogout = async () => {
      await logout();
      router.replace("/(auth)")
    }
    
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold mb-6">
          Profile
        </Text>
        
        <Button 
          title="Logout"
          onPress={handleLogout} 
          className="bg-white"
        />
      </View>
    )
}

export default Profile