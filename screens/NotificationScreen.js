import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { UseMethod } from '../composable/useMethod';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationScreen = ({ navigation }) => {
  const { 
    markAsRead, 
    markAllAsRead,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchAllNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Using the backend endpoint that checks user check-in data
      const res = await UseMethod('get', 'notifications/all');
      const items = res?.data?.data || [];
      const sortedItems = items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllNotifications(sortedItems);
      setUnreadCount(sortedItems.filter(n => !n.is_read).length);
    } catch (e) {
      console.error('Error fetching all notifications:', e);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh notifications
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllNotifications();
    setRefreshing(false);
  };



  // Mark notification as read and navigate to event
  const handleNotificationPress = async (notification) => {
    try {
      // Mark as read using context
      await markAsRead(notification.id);
      
      // Navigate to Event Details with eventId; let the screen fetch
      if (notification.event_id) {
        navigation.navigate('EventDetails', {
          event: null,
          eventId: notification.event_id,
          mode: 'register',
        });
      }
    console.log(notification.event_id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };



  // Fetch notifications when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAllNotifications();
    }, [fetchAllNotifications])
  );

  // Render notification item
  const renderNotificationItem = ({ item }) => {
    const isUnread = !item.is_read;
    const iconColor = isUnread ? '#667eea' : '#9ca3af';
    const badgeBg = isUnread ? '#eef2ff' : '#f1f5f9';
    const badgeText = isUnread ? '#4f46e5' : '#64748b';

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isUnread && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.leftIconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: isUnread ? '#e0e7ff' : '#e5e7eb' }]}> 
            <Ionicons name="notifications-outline" size={20} color={iconColor} />
          </View>
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.titleRow}>
              {isUnread && <View style={styles.unreadDot} />}
              <Text style={[
                styles.notificationTitle,
                isUnread && styles.unreadText
              ]}>
                {item.title || 'Notification'}
              </Text>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}> 
                <Text style={[styles.badgeText, { color: badgeText }]}>{isUnread ? 'New' : 'Info'}</Text>
              </View>
            </View>
            <Text style={styles.notificationTime}>
              {formatTime(item.created_at)}
            </Text>
          </View>

          <Text style={[
            styles.notificationBody,
            isUnread && styles.unreadBodyText
          ]}>
            {item.body || 'No description available'}
          </Text>
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isUnread ? '#667eea' : '#9ca3af'} 
        />
      </TouchableOpacity>
    );
  };

  // Format time helper
  const formatTime = (dateString) => {
    try {
      if (!dateString) return 'Unknown time';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown time';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Ionicons name="notifications" size={22} color="#fff" />
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={16} color="#fff" />
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented filter */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentItem, !showUnreadOnly && styles.segmentActive]}
            onPress={() => setShowUnreadOnly(false)}
          >
            <Text style={[styles.segmentText, !showUnreadOnly && styles.segmentTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentItem, showUnreadOnly && styles.segmentActive]}
            onPress={() => setShowUnreadOnly(true)}
          >
            <Text style={[styles.segmentText, showUnreadOnly && styles.segmentTextActive]}>Unread ({unreadCount})</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications list */}
      <FlatList
        data={showUnreadOnly ? allNotifications.filter(n => !n.is_read) : allNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#667eea"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image source={require('../assets/no_mydata.png')} style={styles.emptyImage} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You’re all caught up. We’ll let you know when there’s something new.</Text>
          </View>
        }
        contentContainerStyle={allNotifications.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Toggle styles removed as they're no longer needed
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 8,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  segmentActive: {
    backgroundColor: '#fff',
  },
  segmentText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#4f46e5',
  },
  unreadBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unreadBadgeText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  leftIconContainer: {
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  unreadText: {
    color: '#111827',
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadBodyText: {
    color: '#374151',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});

export default NotificationScreen;