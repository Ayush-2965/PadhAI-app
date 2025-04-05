import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { getCurrentUser } from '../../../utils/appwrite';
import { saveStudySession } from '../../../utils/appwrite';
import * as Haptics from 'expo-haptics';
import TranslatedText from '../../../components/TranslatedText';
import { translateText } from '../../../utils/i18n';
import { useLanguage } from '../../../context/LanguageContext';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Timer = () => {
  const params = useLocalSearchParams();
  const { subject, topic, timeSlot, taskId } = params;
  const { language } = useLanguage();
  
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
  
  const handleReset = async () => {
    if (isActive) {
      const title = await translateText("Reset Timer", language);
      const message = await translateText("Are you sure you want to reset the timer? Your progress will be lost.", language);
      const cancelText = await translateText("Cancel", language);
      const resetText = await translateText("Reset", language);
      
      Alert.alert(
        title,
        message,
        [
          { text: cancelText, style: "cancel" },
          { 
            text: resetText, 
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
        const errorTitle = await translateText("Error", language);
        const errorMsg = await translateText("You must be logged in to save your study session.", language);
        Alert.alert(errorTitle, errorMsg);
        return;
      }
      
      const sessionData = {
        userId: user.$id,
        subject,
        topic,
        taskId,
        timeSlot,
        duration: totalDuration,
        studyTime: totalDuration - timeLeft,
        pauseCount,
        completed: timeLeft === 0,
        startTime: sessionStartTime ? sessionStartTime.toISOString() : new Date().toISOString(),
        endTime: new Date().toISOString()
      };
      
      await saveStudySession(sessionData);
      
      const successTitle = await translateText("Session Completed!", language);
      const successMsg = await translateText("Your study session has been saved. Great job!", language);
      const okText = await translateText("OK", language);
      
      Alert.alert(
        successTitle,
        successMsg,
        [{ text: okText, onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error saving study session:", error);
      const errorTitle = await translateText("Error", language);
      const errorMsg = await translateText("Failed to save your study session. Please try again.", language);
      Alert.alert(errorTitle, errorMsg);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSubmitEarly = async () => {
    if (isActive) {
      const title = await translateText("Complete Task Early", language);
      const message = await translateText("Are you sure you want to mark this task as completed?", language);
      const cancelText = await translateText("Cancel", language);
      const completeText = await translateText("Complete", language);
      
      Alert.alert(
        title,
        message,
        [
          { text: cancelText, style: "cancel" },
          { 
            text: completeText, 
            onPress: () => {
              clearInterval(intervalRef.current);
              handleComplete();
            }
          }
        ]
      );
    } else {
      const title = await translateText("Start Timer", language);
      const message = await translateText("Please start the timer before completing the task.", language);
      Alert.alert(title, message);
    }
  };
  
  const handleExit = async () => {
    if (isActive && !isPaused && timeLeft > 0) {
      const title = await translateText("Exit Timer", language);
      const message = await translateText("Your timer is still running. Are you sure you want to exit?", language);
      const cancelText = await translateText("Cancel", language);
      const exitText = await translateText("Exit", language);
      
      Alert.alert(
        title,
        message,
        [
          { text: cancelText, style: "cancel" },
          { 
            text: exitText, 
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
        <TranslatedText text="Study Timer" style={styles.headerTitle} />
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.infoCard}>
        <TranslatedText text={subject} style={styles.subject} />
        <TranslatedText text={topic} style={styles.topic} />
        <TranslatedText text={timeSlot} style={styles.timeSlot} />
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
          <TranslatedText text={formatTime(timeLeft)} style={styles.timerText} />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={handleReset}
          disabled={!isActive || isSaving}
        >
          <MaterialIcons name="refresh" size={24} color="white" />
          <TranslatedText text="Reset" style={styles.buttonText} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            isPaused ? styles.resumeButton : isActive ? styles.pauseButton : styles.startButton
          ]} 
          onPress={handleStart}
          disabled={timeLeft === 0 || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons 
                name={isPaused ? "play-arrow" : isActive ? "pause" : "play-arrow"} 
                size={24} 
                color="white" 
              />
              <TranslatedText 
                text={isPaused ? "Resume" : isActive ? "Pause" : "Start"}
                style={styles.buttonText}
              />
            </>
          )}
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
          <TranslatedText text="Complete Task" style={styles.buttonText} />
        </TouchableOpacity>
      )}
      
      {isActive && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <TranslatedText text="Elapsed" style={styles.statLabel} />
            <TranslatedText text={formatTime(totalDuration - timeLeft)} style={styles.statValue} />
          </View>
          <View style={styles.statItem}>
            <TranslatedText text="Pauses" style={styles.statLabel} />
            <TranslatedText text={pauseCount.toString()} style={styles.statValue} />
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