import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Import Expo Icons
import { useLocalSearchParams } from "expo-router";

export default function DateTimeSelector({ mode = "date", setSelectedDate, selectedDate }) {
  // const [date, setDate] = useState(new Date());
  // const {setSelectedDate,selectedDate} =useLocalSearchParams()
  const [showPicker, setShowPicker] = useState(false);
  console.log('====================================');
  console.log(selectedDate);
  console.log('====================================');
  // Function to handle date change
  const onChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 2 }}>
      {/* Date/Time Selection Row */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#C492A5",
          backgroundColor: "#FFE7EF",
        }}
        onPress={() => setShowPicker(true)}
      >
        <MaterialCommunityIcons name={mode === "date" ? "calendar" : "clock"} size={24} color="black" />
        <Text style={{ marginLeft: 10, fontSize: 16 }}>
          {selectedDate ?
            `${selectedDate.getDate().toString().padStart(2, '0')}/ ${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/ ${selectedDate.getFullYear()}`
            : "Select a Date"}
        </Text>
      </TouchableOpacity>

      {/* DateTime Picker (Hidden, Opens when Needed) */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()} // Fallback to current date
          mode={mode} // "date" or "time"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}
