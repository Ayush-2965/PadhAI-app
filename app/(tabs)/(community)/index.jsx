import { Image, StyleSheet, TouchableOpacity, View, ActivityIndicator, ScrollView, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Calendar } from 'react-native-calendars';
import { getCurrentUser, getUserPlanner } from "../../../utils/appwrite";
import TranslatedText from "../../../components/TranslatedText";

const Community = () => {
  const [loading, setLoading] = useState(true);
  const [plannerData, setPlannerData] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [plannerCount, setPlannerCount] = useState(0);

  useEffect(() => {
    const fetchPlanner = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const planner = await getUserPlanner(user.$id);
          if (planner) {
            console.log("Planner data:", planner.plannerData);
            const data = JSON.parse(planner.plannerData);
            setPlannerData(data);
            
            // Set planner count from metadata or default to 1 if planner exists
            setPlannerCount(planner.plannerCount || 1);
            
            const marks = {};
            
            if (data && data.study_plan && Array.isArray(data.study_plan)) {
              const startDate = new Date();
              
              data.study_plan.forEach((dayPlan, index) => {
                const planDate = new Date(startDate);
                planDate.setDate(planDate.getDate() + parseInt(dayPlan.day) - 1);
                
                const dateString = planDate.toISOString().split('T')[0];
                marks[dateString] = {
                  marked: true,
                  dotColor: '#A0456E',
                  selected: dateString === selectedDate,
                  selectedColor: '#FFE7EF',
                };
              });
            } else {
              console.log("Planner data doesn't have the expected structure:", data);
            }
            
            setMarkedDates(marks);
          }
        }
      } catch (error) {
        console.error("Error fetching planner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanner();
  }, [selectedDate]);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const getTasksForSelectedDate = () => {
    if (!plannerData || !plannerData.study_plan) return [];
    
    const startDate = new Date();
    const selectedDateObj = new Date(selectedDate);
    
    const diffTime = Math.abs(selectedDateObj - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dayPlan = plannerData.study_plan.find(day => parseInt(day.day) === diffDays + 1);
    
    return dayPlan ? dayPlan.task : [];
  };

  const handleCreateNewPlanner = () => {
    if (plannerCount >= 2) {
      alert("You've reached the maximum limit of 2 planners. Please use your existing planner.");
      setShowDropdown(false);
      return;
    }
    
    router.push("/planner");
    setShowDropdown(false);
  };

  const renderPlannerContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A0456E" />
        </View>
      );
    }

    if (!plannerData) {
      return (
        <View style={{marginTop:32, alignItems:"center", height:"75%"}}>
          <Image 
            source={require("../../../assets/images/planner.png")} 
            style={{width:"90%", height:"72%", resizeMode:"contain"}} 
          />
          <TranslatedText 
            text="Generate a personalized study planner tailored to your schedule and goals, keeping you organized and focused."
            style={{textAlign:"center", paddingHorizontal:24}}
          />
          <TouchableOpacity 
            style={{
              backgroundColor:"#A0456E",
              borderRadius:30,
              padding:16,
              paddingHorizontal:32, 
              marginVertical:16,
              flexDirection:"row",
              gap:8
            }}
            onPress={() => router.push("/planner")}
          >
            <TranslatedText text="Generate Planner" style={{color:"white"}} />
            <AntDesign name="arrowright" size={22} height={18} color={"white"}/>
          </TouchableOpacity>
        </View>
      );
    }

    const tasksForSelectedDate = getTasksForSelectedDate();

    return (
      <ScrollView className="flex-1 p-4">
        <Calendar
          markedDates={markedDates}
          onDayPress={onDayPress}
          theme={{
            backgroundColor: '#FFE7EF',
            calendarBackground: '#FFE7EF',
            textSectionTitleColor: '#A0456E',
            selectedDayBackgroundColor: '#A0456E',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#A0456E',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#A0456E',
            selectedDotColor: '#ffffff',
            arrowColor: '#A0456E',
            monthTextColor: '#A0456E',
            indicatorColor: '#A0456E',
          }}
        />
        
        <View className="mt-4">
          <TranslatedText 
            text={`Schedule for ${new Date(selectedDate).toDateString()}`} 
            className="text-lg font-bold mb-2 text-[#A0456E]"
          />
          
          {tasksForSelectedDate && tasksForSelectedDate.length > 0 ? (
            tasksForSelectedDate.map((task, index) => (
              <TouchableOpacity 
                key={index} 
                className="bg-white p-4 rounded-lg mb-2 shadow-sm"
                onPress={() => router.push({
                  pathname: "/timer",
                  params: {
                    subject: task.subject,
                    topic: task.topic,
                    timeSlot: task.time_slot,
                    taskId: task.task_id
                  }
                })}
              >
                <View className="flex-row justify-between">
                  <TranslatedText text={task.subject} className="font-bold text-[#A0456E]" />
                  <View className={`px-2 py-1 rounded-full ${
                    task.priority === 'High' ? 'bg-red-100' : 
                    task.priority === 'Medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <TranslatedText className={`text-xs ${
                      task.priority === 'High' ? 'text-red-600' : 
                      task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} text={task.priority} />
                  </View>
                </View>
                <TranslatedText text={task.time_slot} className="text-gray-600 mt-1" />
                <TranslatedText text={task.topic} className="text-gray-500 mt-1" />
                <View className="mt-2 pt-2 border-t border-gray-100">
                  <TranslatedText text={task.feedback_quotes} className="text-xs italic text-gray-400" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white p-4 rounded-lg mb-2 shadow-sm">
              <TranslatedText text="No tasks scheduled for this day" className="text-center text-gray-500" />
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const menuOptions = [
    {
      title: "Create New Planner",
      icon: "add-circle-outline",
      action: handleCreateNewPlanner
    },
    {
      title: "View Analytics",
      icon: "bar-chart",
      action: () => {
        // Analytics action
        setShowDropdown(false);
      }
    },
    {
      title: "Settings",
      icon: "settings",
      action: () => {
        // Settings action
        setShowDropdown(false);
      }
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFE7EF" }}>
      <View style={{ flex: 1 }}>
        <View className="h-10 w-full flex-row justify-between items-center" style={{ padding: 8, marginVertical: 8}}>
          <Image
            source={require("../../../assets/images/menu.png")}
            style={{ width: 32, height: 32, resizeMode: "contain" }}
          />
          <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
            <Image
              source={require("../../../assets/images/filter.png")}
              style={{ width: 32, height: 32, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <View 
            style={{
              position: 'absolute',
              top: 50,
              right: 10,
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 10,
              zIndex: 1000,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <TouchableOpacity 
              className="flex-row items-center py-2 px-3"
              onPress={handleCreateNewPlanner}
            >
              <MaterialIcons name="add" size={20} color="#A0456E" />
              <TranslatedText text="Create New Planner" className="ml-2 text-[#A0456E]" />
            </TouchableOpacity>
            
            <View className="border-t border-gray-200 my-1" />
            
            <View className="py-2 px-3">
              <TranslatedText text={`${plannerCount}/2 planners created`} className="text-xs text-gray-500" />
            </View>
          </View>
        )}

        {renderPlannerContent()}
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
});