import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Video } from 'expo-av'

const { width, height } = Dimensions.get('window')

// Sample video data
const DUMMY_VIDEOS = [
  {
    id: '1',
    videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
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
    videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
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
    videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
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

const Videos = () => {
  const [videos, setVideos] = useState(DUMMY_VIDEOS)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)

  const pickVideo = async () => {
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
      quality: 1,
    })
    
    if (!result.canceled) {
      // Handle the new video
      const newVideo = {
        id: String(videos.length + 1),
        videoUri: result.assets[0].uri,
        user: {
          username: 'me',
          profilePic: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        description: 'My new educational video #learning',
        likes: 0,
        comments: 0,
        shares: 0
      }
      
      setVideos([newVideo, ...videos])
      alert("Video uploaded successfully!")
    }
  }

  const renderVideo = ({ item, index }) => {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: item.videoUri }}
          style={styles.video}
          resizeMode="cover"
          shouldPlay={currentlyPlaying === index}
          isLooping
          onPlaybackStatusUpdate={status => {
            if (status.isPlaying) {
              setCurrentlyPlaying(index)
            }
          }}
        />
        
        {/* User info and description */}
        <View style={styles.videoInfo}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.user.profilePic }} style={styles.profilePic} />
            <Text style={styles.username}>{item.user.username}</Text>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        
        {/* Right side interaction buttons */}
        <View style={styles.interactions}>
          <TouchableOpacity style={styles.interactionButton}>
            <AntDesign name="heart" size={28} color="white" />
            <Text style={styles.interactionText}>{item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.interactionButton}>
            <Feather name="message-circle" size={28} color="white" />
            <Text style={styles.interactionText}>{item.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="share-social-outline" size={28} color="white" />
            <Text style={styles.interactionText}>{item.shares}</Text>
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
        <Text style={styles.headerTitle}>Educational Reels</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Videos List */}
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
    </SafeAreaView>
  )
}

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
})