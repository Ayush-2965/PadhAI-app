import { View } from 'react-native'
import React from 'react'
import TranslatedText from '../../../components/TranslatedText'

const forum = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <TranslatedText text="Forum Coming Soon" className="text-xl font-bold text-[#A0456E]" />
      <TranslatedText text="This feature is under development" className="text-gray-500 mt-2" />
    </View>
  )
}

export default forum