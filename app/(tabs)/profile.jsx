import { View, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { logout } from '../../utils/appwrite'
import TranslatedText from '../../components/translated'
import withTranslation from '../../components/withTranslation'

const Profile = ({ translation }) => {
    const router = useRouter()
    
    const handleLogout = async () => {
      await logout();
      router.replace("/(auth)")
    }
    
    return (
      <View className="flex-1 items-center justify-center p-4">
        <TranslatedText 
          text="Profile" 
          className="text-2xl font-bold mb-6"
        />
        
        <Button 
          title={translation.language === 'en' ? "Logout" : 
                 translation.translate("Logout")} 
          onPress={handleLogout} 
          className="bg-white"
        />
      </View>
    )
}

export default withTranslation(Profile)