import { View, ActivityIndicator } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import TranslatedText from '../../../components/TranslatedText';

const Calendar = () => {
  const { plannerData } = useLocalSearchParams();
  const scheduleData = JSON.parse(plannerData);

  return (
    <View className="flex-1 bg-white p-4">
      <TranslatedText text="Your Study Schedule" className="text-xl font-bold mb-4" />
      {/* Add your calendar visualization here using scheduleData */}
      <TranslatedText text={JSON.stringify(scheduleData, null, 2)} />
    </View>
  );
};

export default Calendar; 