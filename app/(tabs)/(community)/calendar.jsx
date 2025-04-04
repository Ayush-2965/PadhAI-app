import { View, Text, ActivityIndicator } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

const Calendar = () => {
  const { plannerData } = useLocalSearchParams();
  const scheduleData = JSON.parse(plannerData);

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">Your Study Schedule</Text>
      {/* Add your calendar visualization here using scheduleData */}
      <Text>{JSON.stringify(scheduleData, null, 2)}</Text>
    </View>
  );
};

export default Calendar; 