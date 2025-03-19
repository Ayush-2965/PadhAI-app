import { ImageBackground, Text, View } from "react-native";
import { StatusBar } from "react-native";
import Slider from '../components/Slider'
export default function Index() {
  return (
    <>
    <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
    <Slider />
    </>
  );
}
