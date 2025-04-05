import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions, StatusBar, TextInput, Modal, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Video } from 'expo-av'
import TranslatedText from '../../components/TranslatedText'
import TranslatedContent from '../../components/TranslatedContent'
import { uploadVideo, uploadSimpleVideo, getAllVideos, getCurrentUser, getVideoPreviewUrl } from '../../utils/appwrite'
import * as FileSystem from 'expo-file-system'

const { width, height } = Dimensions.get('window')

const Videos = () => {
  const [videos, setVideos] = useState([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [user, setUser] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedVideoUri, setSelectedVideoUri] = useState(null)
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [videoErrors, setVideoErrors] = useState({})
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Fetch videos from Appwrite
        const videosData = await getAllVideos(20);
        
        if (videosData && videosData.length > 0) {
          // Transform video data to include video URIs
          const transformedVideos = videosData.map(video => ({
            id: video.$id,
            videoUri: getVideoPreviewUrl(video.fileId),
            user: {
              username: video.userId, // You might want to fetch user details separately
              profilePic: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            description: video.description,
            likes: video.likes || 0,
            comments: video.comments || 0,
            shares: video.shares || 0
          }));
          
          setVideos(transformedVideos);
        } else {
          // Load dummy videos as fallback when no videos are available
          setVideos(DUMMY_VIDEOS);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Load dummy videos as fallback
        setVideos(DUMMY_VIDEOS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const pickVideo = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (permissionResult.granted === false) {
        alert("You need to grant permission to access your media library")
        return
      }
      
      // Launch media library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.5, // Reduce quality to help with upload size
        videoQuality: 'medium', // Use medium quality for videos
      })
      
      if (!result.canceled) {
        // Check file size
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        setVideoInfo(fileInfo);
        
        if (fileInfo.size > 50 * 1024 * 1024) { // Larger than 50MB
          alert("Video is too large. Please select a smaller video (under 50MB).");
          return;
        }
        
        setSelectedVideoUri(result.assets[0].uri);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error picking video:", error);
      alert("Failed to select video. Please try again.");
    }
  }
  
  const handleUploadVideo = async () => {
    if (!user) {
      alert("Please log in to upload videos");
      return;
    }
    
    if (!selectedVideoUri) {
      alert("No video selected");
      return;
    }
    
    try {
      setModalVisible(false);
      setUploading(true);
      setUploadProgress(0);
      
      // Size warning for large files
      if (videoInfo && videoInfo.size > 15 * 1024 * 1024) {
        alert("This is a large video file. Upload may take longer and could fail on unstable connections. We recommend using WiFi.");
      }
      
      // Show initial progress feedback
      alert("Starting video upload. This may take a few minutes. Please don't close the app.");
      
      console.log("Trying simplified upload approach...");
      // Try the simplified upload approach
      let videoRecord = null;
      try {
        videoRecord = await uploadSimpleVideo(
          user.$id,
          selectedVideoUri,
          description,
          subject
        );
        console.log("Simple upload succeeded!");
      } catch (simpleError) {
        console.error("Simple upload failed:", simpleError);
        alert("First upload attempt failed. Trying alternative method...");
        
        // If simplified upload fails, try original method
        videoRecord = await uploadVideo(
          user.$id, 
          selectedVideoUri, 
          description,
          subject
        );
      }
      
 
      if (!videoRecord) {
        throw new Error("Failed to upload video after multiple attempts");
      }

      const newVideo = {
        id: videoRecord.$id,
        videoUri: getVideoPreviewUrl(videoRecord.fileId),
        user: {
          username: user.email ? user.email.split('@')[0] : 'User',
          profilePic: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        description: description || "Educational video",
        likes: 0,
        comments: 0,
        shares: 0
      }
      
      setVideos([newVideo, ...videos]);
      alert("Video uploaded successfully!");
      
      // Reset form and state
      setSelectedVideoUri(null);
      setDescription('');
      setSubject('');
      setVideoInfo(null);
    } catch (error) {
      console.error("Video upload failed:", error);
      
      // Provide more specific error handling based on error message
      if (error.message && error.message.includes("network")) {
        alert("Network error: Please check your internet connection and try again. Make sure you're on a stable WiFi network.");
      } else if (error.message && error.message.includes("too large")) {
        alert("Video file is too large. Please select a smaller video (under 50MB).");
      } else if (error.message && error.message.includes("not found")) {
        alert("The selected video file could not be accessed. Please try selecting another video.");
      } else if (error.message && error.message.includes("undefined")) {
        alert("Server error: The upload service had a problem processing your video. Please try a smaller video file (under 10MB).");
      } else {
        alert(`Upload failed: ${error.message || "Unknown error"}. Please try again later with a smaller video.`);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  const renderVideo = ({ item, index }) => {
    return (
      <View style={styles.videoContainer}>
        {videoErrors[item.id] ? (
          <View style={[styles.video, styles.videoErrorContainer]}>
            <MaterialIcons name="error" size={40} color="#BD835D" />
            <Text style={styles.videoErrorText}>Failed to load video</Text>
          </View>
        ) : (
          <Video
            source={typeof item.videoUri === 'string' ? { uri: item.videoUri } : item.videoUri}
            style={styles.video}
            resizeMode="cover"
            shouldPlay={currentlyPlaying === index}
            isLooping
            useNativeControls={false}
            onError={(error) => {
              console.error(`Video playback error: ${error}`);
              setVideoErrors(prev => ({ ...prev, [item.id]: true }));
            }}
            onPlaybackStatusUpdate={status => {
              if (status && status.isPlaying) {
                setCurrentlyPlaying(index)
              }
            }}
          />
        )}
        
        {/* User info and description */}
        <View style={styles.videoInfo}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.user.profilePic }} style={styles.profilePic} />
            <TranslatedText text={item.user.username} style={styles.username} />
            <TouchableOpacity style={styles.followButton}>
              <TranslatedText text="Follow" style={styles.followText} />
            </TouchableOpacity>
          </View>
          <TranslatedText text={item.description} style={styles.description} />
        </View>
        
        {/* Right side interaction buttons */}
        <View style={styles.interactions}>
          <TouchableOpacity style={styles.interactionButton}>
            <AntDesign name="heart" size={28} color="white" />
            <TranslatedText text={item.likes.toString()} style={styles.interactionText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.interactionButton}>
            <Feather name="message-circle" size={28} color="white" />
            <TranslatedText text={item.comments.toString()} style={styles.interactionText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="share-social-outline" size={28} color="white" />
            <TranslatedText text={item.shares.toString()} style={styles.interactionText} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TranslatedText text="Educational Reels" style={styles.headerTitle} />
        <TouchableOpacity 
          style={[styles.uploadButton, uploading && styles.disabledButton]} 
          onPress={pickVideo}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <AntDesign name="plus" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Videos List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD835D" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      ) : uploading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD835D" />
          <Text style={styles.loadingText}>Uploading video... {Math.round(uploadProgress)}%</Text>
          <Text style={styles.loadingSubText}>Please wait and keep the app open</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideo}
          keyExtractor={item => item.id}
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={height - 50}
          snapToAlignment="start"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems.length > 0) {
              setCurrentlyPlaying(viewableItems[0].index)
            }
          }}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
        />
      )}
      
      {/* Video Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Educational Video</Text>
            
            {videoInfo && (
              <View style={styles.videoInfoContainer}>
                <Text style={styles.videoInfoText}>
                  File size: {(videoInfo.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
                {videoInfo.size > 10 * 1024 * 1024 && (
                  <Text style={styles.videoWarningText}>
                    Large videos may take longer to upload
                  </Text>
                )}
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Enter video description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            
            <TextInput
              style={styles.input}
              placeholder="Subject (e.g., Math, Science, History)"
              value={subject}
              onChangeText={setSubject}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.uploadButton]}
                onPress={handleUploadVideo}
              >
                <Text style={styles.buttonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Sample video data as fallback
const DUMMY_VIDEOS = [
  {
    id: '1',
    videoUri: require('../../assets/videos/1.mp4'),
    user: {
      username: 'student_123',
      profilePic: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    description: 'Understanding Newton\'s laws of motion through visual examples. #physics #study',
    likes: 245,
    comments: 18,
    shares: 5
  },
  {
    id: '2',
    videoUri: require('../../assets/videos/2.mp4'),
    user: {
      username: 'math_teacher',
      profilePic: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    description: 'Quick trick to solve quadratic equations faster! #mathematics #algebra',
    likes: 789,
    comments: 42,
    shares: 21
  },
  {
    id: '3',
    videoUri: require('../../assets/videos/1.mp4'),
    user: {
      username: 'chemistry_101',
      profilePic: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    description: 'Watch what happens when we mix these compounds! #chemistry #experiment',
    likes: 562,
    comments: 31,
    shares: 15
  },
]

export default Videos

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor:"#F1BED1"
  },
  headerTitle: {
    color: '#C46287',
    fontSize: 20,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#BD835D',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: width,
    height: height - 100,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 70,
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  followButton: {
    backgroundColor: '#BD835D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  followText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    color: 'white',
    fontSize: 14,
    paddingRight: 20,
  },
  interactions: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
  },
  interactionButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  interactionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#BD835D',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#A0456E',
  },
  videoInfoContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  videoInfoText: {
    fontSize: 14,
    color: '#333',
  },
  videoWarningText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoErrorContainer: {
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoErrorText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});