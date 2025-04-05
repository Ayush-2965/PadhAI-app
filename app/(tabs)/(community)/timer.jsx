import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { getCurrentUser } from '../../../utils/appwrite';
import { saveStudySession } from '../../../utils/appwrite';
import * as Haptics from 'expo-haptics';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Timer = () => {
  const params = useLocalSearchParams();
  const { subject, topic, timeSlot, taskId } = params;
  
  // Parse time slot (format: "10:00 - 11:00")
  const [startTime, endTime] = timeSlot.split(' - ');
  
  // Calculate duration in seconds
  const calculateDuration = () => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    return durationMinutes * 60; // Convert to seconds
  };
  
  const totalDuration = calculateDuration();
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const intervalRef = useRef(null);
  
  // Progress calculation
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  
  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setSessionStartTime(new Date());
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isPaused) {
      // Resume
      setIsPaused(false);
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Pause
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setPauseCount(prev => prev + 1);
      setTotalStudyTime(prev => prev + (totalDuration - timeLeft));
    }
  };
  
  const handleReset = () => {
    if (isActive) {
      Alert.alert(
        "Reset Timer",
        "Are you sure you want to reset the timer? Your progress will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Reset", 
            style: "destructive",
            onPress: () => {
              clearInterval(intervalRef.current);
              setTimeLeft(totalDuration);
              setIsActive(false);
              setIsPaused(false);
              setSessionStartTime(null);
              setTotalStudyTime(0);
              setPauseCount(0);
            }
          }
        ]
      );
    }
  };
  
  const handleComplete = async () => {
    try {
      setIsSaving(true);
      
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in to save your study session.");
        return;
      }
      
      // Calculate study time in minutes (to stay within Appwrite's 1-1000 range)
      const studyTimeMinutes = Math.min(Math.max(Math.round((totalDuration - timeLeft) / 60), 1), 1000);
      const durationMinutes = Math.min(Math.max(Math.round(totalDuration / 60), 1), 1000);
      
      const sessionData = {
        userId: user.$id,
        subject,
        topic,
        taskId,
        timeSlot,
        duration: durationMinutes, // Duration in minutes (1-1000 range)
        studyTime: studyTimeMinutes, // Study time in minutes (1-1000 range)
        pauseCount,
        completed: timeLeft === 0,
        startTime: sessionStartTime ? sessionStartTime.toISOString() : new Date().toISOString(),
        endTime: new Date().toISOString()
      };
      
      await saveStudySession(sessionData);
      Alert.alert(
        "Session Completed!",
        "Your study session has been saved. Great job!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error saving study session:", error);
      Alert.alert("Error", "Failed to save your study session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSubmitEarly = () => {
    if (isActive) {
      Alert.alert(
        "Complete Task Early",
        "Are you sure you want to mark this task as completed?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Complete", 
            onPress: () => {
              clearInterval(intervalRef.current);
              handleComplete();
            }
          }
        ]
      );
    } else {
      Alert.alert("Start Timer", "Please start the timer before completing the task.");
    }
  };
  
  const handleExit = () => {
    if (isActive && !isPaused && timeLeft > 0) {
      Alert.alert(
        "Exit Timer",
        "Your timer is still running. Are you sure you want to exit?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Exit", 
            style: "destructive",
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <AntDesign name="arrowleft" size={24} color="#A0456E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Timer</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.subject}>{subject}</Text>
        <Text style={styles.topic}>{topic}</Text>
        <Text style={styles.timeSlot}>{timeSlot}</Text>
      </View>
      
      <View style={styles.timerContainer}>
        <View style={styles.progressRing}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress}%`,
                backgroundColor: progress < 30 ? '#A0456E' : 
                               progress < 70 ? '#DB8AA9' : '#8BC34A'
              }
            ]} 
          />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            !isActive ? styles.startButton : 
            isPaused ? styles.resumeButton : styles.pauseButton
          ]}
          onPress={handleStart}
          disabled={isSaving}
        >
          {!isActive ? (
            <>
              <MaterialIcons name="play-arrow" size={24} color="white" />
              <Text style={styles.buttonText}>Start</Text>
            </>
          ) : isPaused ? (
            <>
              <MaterialIcons name="play-arrow" size={24} color="white" />
              <Text style={styles.buttonText}>Resume</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="pause" size={24} color="white" />
              <Text style={styles.buttonText}>Pause</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          disabled={!isActive || isSaving}
        >
          <MaterialIcons name="refresh" size={24} color="white" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      {/* Submit Early Button */}
      {isActive && timeLeft > 0 && (
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmitEarly}
          disabled={isSaving}
        >
          <MaterialIcons name="check-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Complete Task</Text>
        </TouchableOpacity>
      )}
      
      {isActive && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Elapsed</Text>
            <Text style={styles.statValue}>{formatTime(totalDuration - timeLeft)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pauses</Text>
            <Text style={styles.statValue}>{pauseCount}</Text>
          </View>
        </View>
      )}
      
      {isSaving && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color="#A0456E" />
            <Text style={{ marginTop: 10, color: '#A0456E' }}>Saving your progress...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE7EF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A0456E',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A0456E',
    marginBottom: 4,
  },
  topic: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  timeSlot: {
    fontSize: 14,
    color: '#888',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#DB8AA9',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#A0456E',
    opacity: 0.7,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    minWidth: 140,
  },
  startButton: {
    backgroundColor: '#A0456E',
  },
  pauseButton: {
    backgroundColor: '#DB8AA9',
  },
  resumeButton: {
    backgroundColor: '#8BC34A',
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    marginHorizontal: 50,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A0456E',
  },
});

export default Timer; 