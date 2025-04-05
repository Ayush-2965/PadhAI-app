import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../utils/appwrite';
import { savePublicSpeakingFeedback } from '../../utils/appwrite';

const CreateVideo = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timeoutId, setTimeoutId] = useState(null);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetchUser();
    return () => {
      if (timeoutId) clearInterval(timeoutId);
      if (recording) stopRecording();
    };
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (isRecording) {
      const id = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
      setTimeoutId(id);
    } else if (timeoutId) {
      clearInterval(timeoutId);
      setTimeoutId(null);
    }
  }, [isRecording]);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      setFeedback(null);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;
      
      setIsRecording(false);
      setRecordingTime(0);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        processAudio(uri);
      }
      
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
      setIsRecording(false);
      setRecording(null);
    }
  }

  const processAudio = async (uri) => {
    try {
      setProcessingAudio(true);
      
      // Create FormData to send the audio file
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });

      // console.log("Sending audio file to API...");
      
      // Send the audio to the API
      const response = await fetch('https://n8n-jeni.onrender.com/webhook/public-speaking', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      // console.log("API Response:", JSON.stringify(result));

      // Validate the response data - Check for the array and nested output object format
      if (!result || !Array.isArray(result) || !result[0] || !result[0].output) {
        console.error("Invalid API response format:", result);
        Alert.alert(
          "Error", 
          "The API returned an invalid response format. Please try again."
        );
        setProcessingAudio(false);
        return;
      }

      // Extract the data from the nested output property within the array
      const outputData = result[0].output;
      // console.log("Extracted output data:", outputData);

      // Ensure all required fields are present with default values if missing
      const normalizedResult = {
        transcription: outputData.transcription || "",
        fillerWordsCount: outputData.fillerWordsCount || 0,
        mistakes: outputData.mistakes || [],
        alternativeWords: outputData.alternativeWords || [],
        improvementSuggestions: outputData.improvementSuggestions || [],
      };
      
      // console.log("Normalized result:", normalizedResult);
      setFeedback(normalizedResult);
      
      // Save feedback to Appwrite if user is logged in
      if (user && user.$id) {
        try {
          const savedResponse = await savePublicSpeakingFeedback(user.$id, normalizedResult);
          // console.log("Saved to Appwrite:", savedResponse);
        } catch (saveError) {
          console.error("Failed to save to Appwrite:", saveError);
          // Continue execution even if saving fails
        }
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      Alert.alert('Error', 'Failed to process audio. Please try again.');
    } finally {
      setProcessingAudio(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderRecordButton = () => (
    <TouchableOpacity
      style={[
        styles.recordButton,
        isRecording ? styles.recordingButton : null
      ]}
      onPress={isRecording ? stopRecording : startRecording}
    >
      {isRecording ? (
        <MaterialIcons name="stop" size={40} color="white" />
      ) : (
        <MaterialIcons name="mic" size={40} color="white" />
      )}
    </TouchableOpacity>
  );

  const renderTimer = () => (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
      <Text style={styles.maxTimeText}>Max: 00:30</Text>
    </View>
  );

  const renderFeedback = () => {
    if (!feedback) return null;
    
    return (
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Public Speaking Feedback</Text>
        
        <View style={styles.transcriptionContainer}>
          <Text style={styles.sectionTitle}>Your Transcription:</Text>
          <Text style={styles.transcriptionText}>
            {feedback.transcription || "No transcription available"}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{feedback.fillerWordsCount || 0}</Text>
            <Text style={styles.statLabel}>Filler Words</Text>
          </View>
        </View>

        {Array.isArray(feedback.improvementSuggestions) && feedback.improvementSuggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Improvement Suggestions:</Text>
            {feedback.improvementSuggestions.map((suggestion, idx) => (
              <View key={idx} style={styles.suggestionItem}>
                <Ionicons name="bulb-outline" size={20} color="#A0456E" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Improvement Suggestions:</Text>
            <View style={styles.suggestionItem}>
              <Ionicons name="bulb-outline" size={20} color="#A0456E" />
              <Text style={styles.suggestionText}>
                No specific suggestions provided. Try speaking more clearly and for a longer duration.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#A0456E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Public Speaking AI</Text>
          <Text style={styles.subtitle}>
            Practice your public speaking skills with AI feedback
          </Text>
        </View>

        <View style={styles.recordingSection}>
          {renderRecordButton()}
          {isRecording && renderTimer()}
        </View>

        {processingAudio ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A0456E" />
            <Text style={styles.loadingText}>Analyzing your speech...</Text>
          </View>
        ) : (
          renderFeedback()
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instructionsText}>
            1. Tap the microphone button to start recording
          </Text>
          <Text style={styles.instructionsText}>
            2. Speak clearly for up to 30 seconds
          </Text>
          <Text style={styles.instructionsText}>
            3. Tap the stop button or wait for the timer to complete
          </Text>
          <Text style={styles.instructionsText}>
            4. Review AI feedback on your speaking skills
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateVideo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A0456E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#E74C3C',
  },
  timerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  maxTimeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  feedbackContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  transcriptionContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statBox: {
    backgroundColor: '#A0456E15',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    minWidth: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A0456E',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  instructionsContainer: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
});