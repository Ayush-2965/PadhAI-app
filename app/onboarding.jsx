import { StatusBar } from "react-native";
import Slider from '../components/Slider'
export default function Landing() {
  return (
    <>
    <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
    <Slider />
    </>
  );
}