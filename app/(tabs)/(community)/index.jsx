import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router,useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const Community = () => {
  const { selectedDate, timeSlots, subjects } = useLocalSearchParams();
  console.log(subjects)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFE7EF" }}>
      <View>
        <View className="h-10 w-full flex-row items-center" style={{ padding: 8 ,marginVertical: 8}}>
          <Image
            source={require("../../../assets/images/menu.png")}
            style={{ width: 32, height: 32, resizeMode: "contain" }}
          />
        </View>
        <View style={styles.pageSelect}>
          <View style={styles.currPage}>

          <TouchableOpacity onPress={()=>{router.push("/planner")}}>
            
            <Text className=" ">Planner</Text>
          </TouchableOpacity>
          </View>
          <View style={styles.currPage}>
          <TouchableOpacity onPress={()=>{router.push("/forum")}}>
            
            <Text className=" ">Planner</Text>
          </TouchableOpacity>

          </View>
        </View>

        <View style={{marginTop:32,alignItems:"center",height:"75%"}}>
          <Image source={require("../../../assets/images/planner.png") } style={{width:"90%",height:"72%",resizeMode:"contain"}} />
          <Text style={{textAlign:"center", paddingHorizontal:24}}>Generate a personalized study planner tailored to your schedule and goals, keeping you organized and focused.</Text>
          <TouchableOpacity style={{backgroundColor:"#A0456E",borderRadius:30,padding:16,paddingHorizontal:32, marginVertical:16,flexDirection:"row",gap:8}}>
            <Text style={{color:"white"}}>Generate Planner</Text>
            <AntDesign name="arrowright" size={22} height={18} color={"white"}/>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Community;

const styles = StyleSheet.create({
  pageSelect: {
    width: 200,
    height: 48,
    borderRadius: 20,
    padding: 4,
    marginLeft: 24,
    marginTop:8,
    backgroundColor: "#FFDEEB",
    flexDirection: "row",
    justifyContent: "space-between",
    gap:2,
    borderWidth:4,
    borderColor:"lightgray"

  },
  currPage:{
    borderRadius: 14,
    backgroundColor:"#DB8AA9",
    paddingVertical:4,
    paddingHorizontal:8,
    justifyContent:"center",
    alignItems:"center",
    width:"49%"
  }
})