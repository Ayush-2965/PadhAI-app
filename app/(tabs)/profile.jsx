import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, getUserStudySessions, logout } from '../../utils/appwrite';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [studySessions, setStudySessions] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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

  const renderProfileTab = () => {
    if (!user) return null;
    
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.email.split('@')[0]}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Study Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{studySessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(studySessions.reduce((total, session) => total + session.studyTime, 0) / 60)}
              </Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {studySessions.filter(session => session.completed).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveTab('analytics')}>
          <MaterialIcons name="analytics" size={24} color="#A0456E" />
          <Text style={styles.menuItemText}>View Analytics</Text>
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="settings" size={24} color="#A0456E" />
          <Text style={styles.menuItemText}>Settings</Text>
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="help" size={24} color="#A0456E" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <MaterialIcons name="chevron-right" size={24} color="#A0456E" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAnalyticsTab = () => {
    if (analyticsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A0456E" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      );
    }

    if (studySessions.length === 0) {
      return (
        <ScrollView style={styles.analyticsContainer}>
          <View style={styles.analyticsHeader}>
            <TouchableOpacity onPress={() => setActiveTab('profile')}>
              <MaterialIcons name="arrow-back" size={24} color="#A0456E" />
            </TouchableOpacity>
            <Text style={styles.analyticsTitle}>Study Analytics</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="analytics" size={64} color="#DB8AA9" />
            <Text style={styles.emptyStateTitle}>No Study Data Yet</Text>
            <Text style={styles.emptyStateText}>
              Complete study sessions to see your analytics here.
            </Text>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={styles.analyticsContainer}>
        <View style={styles.analyticsHeader}>
          <TouchableOpacity onPress={() => setActiveTab('profile')}>
            <MaterialIcons name="arrow-back" size={24} color="#A0456E" />
          </TouchableOpacity>
          <Text style={styles.analyticsTitle}>Study Analytics</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <Text style={styles.chartTitle}>Time Spent by Subject (minutes)</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={getSubjectData()}
            barWidth={30}
            spacing={20}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={1}
            yAxisThickness={1}
            xAxisColor={'#DDD'}
            yAxisColor={'#DDD'}
            yAxisTextStyle={{ color: '#333' }}
            noOfSections={5}
            maxValue={Math.max(...getSubjectData().map(item => item.value)) * 1.2 || 60}
          />
        </View>
        
        <Text style={styles.chartTitle}>Completion Rate</Text>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={getCompletionRateData()}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={60}
            centerLabelComponent={() => {
              return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, color: '#A0456E', fontWeight: 'bold' }}>
                    {Math.round((studySessions.filter(session => session.completed).length / studySessions.length) * 100)}%
                  </Text>
                  <Text style={{ fontSize: 14, color: '#333' }}>Completed</Text>
                </View>
              );
            }}
          />
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#A0456E' }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFD1DC' }]} />
              <Text style={styles.legendText}>Incomplete</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.chartTitle}>Weekly Study Progress (minutes)</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={getWeeklyProgressData()}
            color="#A0456E"
            thickness={3}
            dataPointsColor="#DB8AA9"
            startFillColor="#A0456E"
            startOpacity={0.2}
            endOpacity={0.1}
            initialSpacing={10}
            endSpacing={10}
            spacing={30}
            maxValue={Math.max(...getWeeklyProgressData().map(item => item.value)) * 1.2 || 60}
            noOfSections={5}
            yAxisTextStyle={{ color: '#333' }}
            xAxisLabelTextStyle={{ color: '#333', textAlign: 'center' }}
          />
        </View>
        
        <Text style={styles.chartTitle}>Recent Study Sessions</Text>
        {studySessions.slice(0, 5).map((session, index) => (
          <View key={index} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionSubject}>{session.subject}</Text>
              <Text style={[
                styles.sessionStatus, 
                { color: session.completed ? '#4CAF50' : '#FF6B6B' }
              ]}>
                {session.completed ? 'Completed' : 'Incomplete'}
              </Text>
            </View>
            <Text style={styles.sessionTopic}>{session.topic}</Text>
            <View style={styles.sessionDetails}>
              <Text style={styles.sessionTime}>
                {new Date(session.startTime).toLocaleDateString()} • {session.timeSlot}
              </Text>
              <Text style={styles.sessionDuration}>
                {Math.round(session.studyTime / 60)} min
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
      {activeTab === 'profile' ? renderProfileTab() : renderAnalyticsTab()}
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
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
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
  pieChartContainer: {
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
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sessionCard: {
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A0456E',
  },
  sessionStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionTopic: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 12,
    color: '#888',
  },
  sessionDuration: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A0456E',
  },
});

export default Profile; 