import React, { useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const CustomTimePicker = memo(({ Hour, Minute, onTimeChange }) => {
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const isInitialMount = useRef(true);

  // Memoize these arrays to prevent recreation
  const hoursArray = React.useMemo(() => 
    [...Array(24)].map((_, i) => i.toString().padStart(2, "0")), 
    []
  );
  
  const minutesArray = React.useMemo(() => 
    [...Array(60)].map((_, i) => i.toString().padStart(2, "0")), 
    []
  );

  const scrollToIndex = (ref, index) => {
    ref.current?.scrollTo({ y: index * 50, animated: false });
  };

  // Initialize scroll position only once
  useEffect(() => {
    if (isInitialMount.current) {
      scrollToIndex(hourScrollRef, Hour);
      scrollToIndex(minuteScrollRef, Minute);
      isInitialMount.current = false;
    }
  }, [Hour, Minute]);

  const adjustTime = (type, action) => {
    const currentValue = type === "hour" ? Hour : Minute;
    let newValue = action === "up" ? currentValue + 1 : currentValue - 1;

    if (type === "hour") {
      newValue = newValue < 0 ? 23 : newValue > 23 ? 0 : newValue;
    } else {
      newValue = newValue < 0 ? 59 : newValue > 59 ? 0 : newValue;
    }

    onTimeChange(newValue, type);
  };

  const handleScrollEnd = (event, type) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / 50);
    onTimeChange(index, type);
  };

  return (
    <View style={styles.container}>
      {/* Hour Picker */}
      <View style={styles.timeColumn}>
        <TouchableOpacity onPress={() => adjustTime("hour", "up")}>
          <MaterialIcons name="arrow-drop-up" size={30} color="#C492A5" />
        </TouchableOpacity>

        <ScrollView
          ref={hourScrollRef}
          style={styles.scrollView}
          snapToInterval={50}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={(e) => handleScrollEnd(e, "hour")}
          contentOffset={{ y: Hour * 50, x: 0 }}
          nestedScrollEnabled={true}
          scrollEnabled={true}
        >
          {hoursArray.map((hour, index) => (
            <View key={hour} style={[styles.item, index === Hour && styles.selectedItem]}>
              <Text style={[styles.timeText, index === Hour && styles.selectedText]}>
                {hour}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={() => adjustTime("hour", "down")}>
          <MaterialIcons name="arrow-drop-down" size={30} color="#C492A5" />
        </TouchableOpacity>
      </View>

      <Text style={styles.separator}>:</Text>

      {/* Minute Picker */}
      <View style={styles.timeColumn}>
        <TouchableOpacity onPress={() => adjustTime("minute", "up")}>
          <MaterialIcons name="arrow-drop-up" size={30} color="#C492A5" />
        </TouchableOpacity>

        <ScrollView
          ref={minuteScrollRef}
          style={styles.scrollView}
          snapToInterval={50}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={(e) => handleScrollEnd(e, "minute")}
          contentOffset={{ y: Minute * 50, x: 0 }}
          nestedScrollEnabled={true}
          scrollEnabled={true}
        >
          {minutesArray.map((minute, index) => (
            <View key={minute} style={[styles.item, index === Minute && styles.selectedItem]}>
              <Text style={[styles.timeText, index === Minute && styles.selectedText]}>
                {minute}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={() => adjustTime("minute", "down")}>
          <MaterialIcons name="arrow-drop-down" size={30} color="#C492A5" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex:0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFE7EF",
    width:160,
    borderRadius:15  
  },

  timeColumn: {
    alignItems: "center",
    width: 40,
  },
  scrollView: {
    height: 50,
    overflow: "hidden",
  },
  item: {
    height: 50,
    justifyContent: "center",
  },
  selectedItem: {
    backgroundColor: "#FFE7EF",
    borderRadius: 10,
  },
  timeText: {
    fontSize: 20,
    textAlign: "center",
    color: "#C492A5",
  },
  selectedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9B3C60",
  },
  separator: {
    fontSize: 30,
    marginHorizontal: 10,
    fontWeight: "bold",
  },
});

export default CustomTimePicker;