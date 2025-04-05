import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, getUserStudySessions, logout, getUserVideos, getVideoPreviewUrl } from '../../utils/appwrite';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import TranslatedText from '../../components/TranslatedText';
import LanguageSelector from '../../components/LanguageSelector';
import { Video } from 'expo-av';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [studySessions, setStudySessions] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [userVideos, setUserVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && user) {
      fetchAnalyticsData();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'videos' && user) {
      fetchUserVideos();
    }
  }, [activeTab, user]);

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const sessions = await getUserStudySessions(user.$id);
      setStudySessions(sessions);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchUserVideos = async () => {
    try {
      setVideosLoading(true);
      const videos = await getUserVideos(user.$id);
      
      // Transform video data to include video URIs
      const transformedVideos = videos.map(video => ({
        id: video.$id,
        videoUri: getVideoPreviewUrl(video.fileId),
        description: video.description,
        subject: video.subject,
        createdAt: new Date(video.createdAt).toLocaleDateString(),
        likes: video.likes,
        comments: video.comments,
        shares: video.shares
      }));
      
      setUserVideos(transformedVideos);
    } catch (error) {
      console.error('Error fetching user videos:', error);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getSubjectData = () => {
    const subjectMap = {};
    
    studySessions.forEach(session => {
      if (!subjectMap[session.subject]) {
        subjectMap[session.subject] = 0;
      }
      subjectMap[session.subject] += session.studyTime;
    });
    
    const colors = ['#A0456E', '#DB8AA9', '#FFB6C1', '#FFC0CB', '#FFD1DC'];
    
    return Object.keys(subjectMap).map((subject, index) => ({
      value: subjectMap[subject] / 60, // Convert seconds to minutes
      label: subject,
      frontColor: colors[index % colors.length],
      topLabelComponent: () => (
        <Text style={{ color: '#333', fontSize: 10 }}>{subject}</Text>
      ),
    }));
  };

  const getCompletionRateData = () => {
    const completed = studySessions.filter(session => session.completed).length;
    const incomplete = studySessions.length - completed;
    
    return [
      {
        value: completed,
        color: '#A0456E',
        gradientCenterColor: '#DB8AA9',
        focused: true,
      },
      {
        value: incomplete,
        color: '#FFD1DC',
      },
    ];
  };

  const getWeeklyProgressData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const dailyStudyTime = {};
    last7Days.forEach(day => {
      dailyStudyTime[day] = 0;
    });
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
      if (dailyStudyTime[sessionDate] !== undefined) {
        dailyStudyTime[sessionDate] += session.studyTime / 60; // Convert to minutes
      }
    });
    
    return Object.keys(dailyStudyTime).map(date => ({
      value: dailyStudyTime[date],
      label: date.slice(5), // Show only MM-DD
      frontColor: '#A0456E',
    }));
  };

  const LanguageSettingsTab = () => {
    return (
      <View style={styles.tabContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setActiveTab('profile')}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
         
          
        </View>
        
        <View style={styles.content}>
          <Text style={styles.languageHeader}>Choose a Language</Text>
          <LanguageSelector style={styles.languageSelector} />
        </View>
      </View>
    );
  };

  const MyVideosTab = () => {
    return (
      <View style={styles.tabContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setActiveTab('profile')}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TranslatedText 
            text="My Videos" 
            style={styles.headerTitle}
          />
        </View>
        
        {videosLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A0456E" />
            <TranslatedText text="Loading videos..." style={styles.loadingText} />
          </View>
        ) : userVideos.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="videocam" size={64} color="#DDB8C7" />
            <TranslatedText 
              text="No videos uploaded yet" 
              style={styles.emptyStateTitle} 
            />
            <TranslatedText 
              text="Your uploaded educational videos will appear here" 
              style={styles.emptyStateMessage} 
            />
            <TouchableOpacity 
              style={styles.uploadVideoButton}
              onPress={() => router.push('/videos')}
            >
              <AntDesign name="plus" size={24} color="white" />
              <TranslatedText text="Upload New Video" style={styles.uploadVideoButtonText} />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={userVideos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.videoCard}>
                <Video
                  source={{ uri: item.videoUri }}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                  useNativeControls
                />
                <View style={styles.videoInfo}>
                  <TranslatedText text={item.description} style={styles.videoTitle} numberOfLines={2} />
                  <View style={styles.videoMetaRow}>
                    <View style={styles.videoMeta}>
                      <MaterialIcons name="category" size={16} color="#A0456E" />
                      <TranslatedText text={item.subject} style={styles.videoMetaText} />
                    </View>
                    <View style={styles.videoMeta}>
                      <MaterialIcons name="date-range" size={16} color="#A0456E" />
                      <TranslatedText text={item.createdAt} style={styles.videoMetaText} />
                    </View>
                  </View>
                  <View style={styles.videoStats}>
                    <View style={styles.videoStat}>
                      <AntDesign name="heart" size={16} color="#A0456E" />
                      <TranslatedText text={item.likes.toString()} style={styles.videoStatText} />
                    </View>
                    <View style={styles.videoStat}>
                      <AntDesign name="message1" size={16} color="#A0456E" />
                      <TranslatedText text={item.comments.toString()} style={styles.videoStatText} />
                    </View>
                    <View style={styles.videoStat}>
                      <AntDesign name="sharealt" size={16} color="#A0456E" />
                      <TranslatedText text={item.shares.toString()} style={styles.videoStatText} />
                    </View>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.videosList}
          />
        )}
      </View>
    );
  };

  const renderProfileTab = () => {
    if (!user) return null;
    
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TranslatedText text={user.email.charAt(0).toUpperCase()} style={styles.avatarText} />
          </View>
          <View style={styles.userInfo}>
            <TranslatedText text={user.email.split('@')[0]} style={styles.userName} />
            <TranslatedText text={user.email} style={styles.userEmail} />
          </View>
        </View>
        
        <View style={styles.statsCard}>
          <TranslatedText text="Study Statistics" style={styles.statsTitle} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <TranslatedText text={studySessions.length.toString()} style={styles.statValue} />
              <TranslatedText text="Sessions" style={styles.statLabel} />
            </View>
            <View style={styles.statItem}>
              <TranslatedText 
                text={Math.round(studySessions.reduce((total, session) => total + session.studyTime, 0) / 60).toString()} 
                style={styles.statValue} 
              />
              <TranslatedText text="Minutes" style={styles.statLabel} />
            </View>
            <View style={styles.statItem}>
              <TranslatedText 
                text={studySessions.filter(session => session.completed).length.toString()} 
                style={styles.statValue} 
              />
              <TranslatedText text="Completed" style={styles.statLabel} />
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveTab('analytics')}>
          <MaterialIcons name="analytics" size={24} color="#A0456E" />
          <TranslatedText text="View Analytics" style={styles.menuItemText} />
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveTab('videos')}>
          <MaterialIcons name="video-library" size={24} color="#A0456E" />
          <TranslatedText text="My Videos" style={styles.menuItemText} />
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setActiveTab('language')}
        >
          <MaterialIcons name="language" size={24} color="#A0456E" />
          <TranslatedText text="Language Settings" style={styles.menuItemText} />
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="settings" size={24} color="#A0456E" />
          <TranslatedText text="Settings" style={styles.menuItemText} />
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="help" size={24} color="#A0456E" />
          <TranslatedText text="Help & Support" style={styles.menuItemText} />
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
          <TranslatedText text="Logout" style={styles.logoutButtonText} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAnalyticsTab = () => {
    if (analyticsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A0456E" />
          <TranslatedText text="Loading analytics..." style={styles.loadingText} />
        </View>
      );
    }

    if (studySessions.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="analytics" size={64} color="#DDB8C7" />
          <TranslatedText 
            text="No study data available yet" 
            style={styles.emptyStateTitle} 
          />
          <TranslatedText 
            text="Complete some study sessions to see your analytics" 
            style={styles.emptyStateMessage} 
          />
        </View>
      );
    }

    return (
      <View style={styles.analyticsContainer}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="subject" size={24} color="#A0456E" />
          <TranslatedText text="Study Time by Subject (minutes)" style={styles.sectionTitle} />
        </View>
        <View style={styles.chartContainer}>
          <BarChart 
            width={300}
            height={200}
            barWidth={22}
            noOfSections={4}
            barBorderRadius={4}
            data={getSubjectData()}
            yAxisTextStyle={{ color: '#333' }}
            xAxisTextStyle={{ color: '#333' }}
            showGradient
          />
        </View>

        <View style={styles.sectionHeader}>
          <MaterialIcons name="check-circle" size={24} color="#A0456E" />
          <TranslatedText text="Completion Rate" style={styles.sectionTitle} />
        </View>
        <View style={styles.chartContainer}>
          <PieChart
            donut
            radius={80}
            innerRadius={50}
            data={getCompletionRateData()}
            centerLabelComponent={() => (
              <TranslatedText 
                text={`${Math.round((studySessions.filter(s => s.completed).length / studySessions.length) * 100)}%`} 
                style={styles.pieChartLabel} 
              />
            )}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#A0456E' }]} />
              <TranslatedText text="Completed" style={styles.legendText} />
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFD1DC' }]} />
              <TranslatedText text="Incomplete" style={styles.legendText} />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <MaterialIcons name="trending-up" size={24} color="#A0456E" />
          <TranslatedText text="Weekly Progress (minutes)" style={styles.sectionTitle} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            width={300}
            height={200}
            data={getWeeklyProgressData()}
            spacing={35}
            color="#A0456E"
            thickness={3}
            startFillColor="#DB8AA9"
            endFillColor="#FFD1DC"
            startOpacity={0.6}
            endOpacity={0.1}
            initialSpacing={10}
            noOfSections={5}
            yAxisTextStyle={{ color: '#333' }}
            xAxisTextStyle={{ color: '#333' }}
            showFractionalValues
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0456E" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <MaterialIcons name="account-circle" size={64} color="#DB8AA9" />
          <Text style={styles.notLoggedInTitle}>Not Logged In</Text>
          <Text style={styles.notLoggedInText}>
            Please log in to view your profile and analytics.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A0456E" />
        </View>
      ) : (
        <>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'language' && <LanguageSettingsTab />}
          {activeTab === 'videos' && <MyVideosTab />}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE7EF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE7EF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A0456E',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A0456E',
    marginTop: 16,
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#A0456E',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileContainer: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A0456E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A0456E',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A0456E',
    borderRadius: 30,
    padding: 16,
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  analyticsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  pieChartLabel: {
    fontSize: 14,
    color: '#333',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A0456E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flex: 1,
    backgroundColor: '#FFE7EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 24,
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pencilIcon: {
    backgroundColor: '#E8DDF2',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#42154F',
  },
  headerDot: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#42154F',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop:0,
    alignItems: 'center',
  },
  languageHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#42154F',
    marginBottom: 40,
    marginTop: 20,
    textAlign: 'center',
  },
  languageSelector: {
    marginTop: 20,
    width: '100%',
  },
  videosList: {
    padding: 16,
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  videoMetaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  videoMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  videoStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  videoStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  uploadVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A0456E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
  },
  uploadVideoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Profile; 