import { View, Text, Image } from 'react-native'
import React from 'react'
import { MotiView } from "moti";
import PencilIcon from "../assets/images/pencil.svg";

const SplashScreen = () => {
  return (
    <View className="flex items-center justify-center h-screen bg-white">
      <MotiView
        from={{ rotate: "-20deg" }}
        animate={{ rotate: "20deg" }}
        transition={{
          type: "timing",
          duration: 700,
          loop: true,
          repeatReverse: true, // Makes it oscillate back and forth
        }}
      >
        <PencilIcon width={100} height={100} fill="blue" style={{ transform: [{ rotate: "180deg" }] }} />
      </MotiView>
      <Image source={require("../assets/images/padhai.png")} />
    </View>
  )
}

export default SplashScreen