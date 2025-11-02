import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UseMethod } from '../composable/useMethod';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Get authentication state
  const { user, apiToken } = useAuth();
  const isLoggedIn = !!(user && apiToken);

  // Keep timing and fetch-state in refs to avoid re-renders causing effect re-subscriptions
  const lastFetchTimeRef = useRef(0);
  const isFetchingRef = useRef(false);

  // Minimum time between fetches (5 minutes)
  const MIN_FETCH_INTERVAL = 1 * 10 * 10;

  // Fetch notifications with smart caching
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    // Don't fetch if user is not logged in
    if (!isLoggedIn) {
      console.log('User not logged in, skipping notification fetch');
      return;
    }

    const now = Date.now();

    // Prevent overlapping calls
    if (isFetchingRef.current) return;

    // Skip fetch if recent fetch happened and not forced
    if (!forceRefresh && (now - lastFetchTimeRef.current) < MIN_FETCH_INTERVAL) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      console.log('🔔 Fetching notifications from API...');
      const response = await UseMethod('get', 'notifications/new');
      
      console.log('📡 API Response Status:', response?.status);
      console.log('📡 API Response Data Status:', response?.data?.status);
      console.log('📡 Raw API Response:', JSON.stringify(response?.data, null, 2));
      
      if (response?.data?.status) {
        const incoming = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log('📥 Incoming notifications count:', incoming.length);
        
        if (incoming.length > 0) {
          console.log('📋 First notification structure:', JSON.stringify(incoming[0], null, 2));
          console.log('📋 All notification fields:', Object.keys(incoming[0]));
        }
        
        setNotifications(prev => {
          const map = new Map(prev.map(n => [n.id, n]));
          for (const n of incoming) {
            if (map.has(n.id)) {
              console.log('🔄 Updating existing notification:', n.id || 'Unknown ID', n.title || 'No title');
              map.set(n.id, { ...map.get(n.id), ...n });
            } else {
              console.log('➕ Adding new notification:', n.id || 'Unknown ID', n.title || 'No title');
              map.set(n.id, n);
            }
          }
          const finalNotifications = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          console.log('📊 Final notifications count:', finalNotifications.length);
          return finalNotifications;
        });
        lastFetchTimeRef.current = now;
      } else {
        console.error('❌ Failed to fetch notifications:', response?.data?.message);
      }
    } catch (error) {
      console.error('💥 Error fetching notifications:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isLoggedIn]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    // Don't mark as read if user is not logged in
    if (!isLoggedIn) {
      console.log('User not logged in, cannot mark notification as read');
      return false;
    }

    try {
      await UseMethod('post', `notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: 1 } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [isLoggedIn]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Don't mark all as read if user is not logged in
    if (!isLoggedIn) {
      console.log('User not logged in, cannot mark all notifications as read');
      return false;
    }

    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      if (unreadNotifications.length === 0) {
        return true;
      }

      // Mark each unread notification as read
      const promises = unreadNotifications.map(n => 
        UseMethod('post', `notifications/${n.id}/read`)
      );
      
      await Promise.all(promises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: 1 }))
      );
      // unreadCount will recompute via useEffect
      
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }, [notifications, isLoggedIn]);

  // Recompute unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, [notifications]);

  // Refresh notifications (force fetch)
  const refreshNotifications = useCallback(() => {
    return fetchNotifications(true);
  }, [fetchNotifications]);

  // Poll for new notifications and accumulate (stable function)
  const pollNewNotifications = useCallback(async () => {
    // Don't poll if user is not logged in
    if (!isLoggedIn) {
      console.log('User not logged in, skipping notification polling');
      return;
    }

    try {
      console.log('🔄 Polling for new notifications...');
      const response = await UseMethod('get', 'notifications/new');
      console.log('🔄 Poll Response:', JSON.stringify(response?.data, null, 2));
      
      if (response?.data?.status) {
        const items = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log('🔄 Polled notifications count:', items.length);
        
        if (items.length > 0) {
          console.log('🔄 New notifications found:', items.map(n => ({ 
            id: n.id || 'Unknown ID', 
            title: n.title || 'No title' 
          })));
          setNotifications(prev => {
            const ids = new Set(prev.map(n => n.id));
            const merged = [...prev];
            let newCount = 0;
            for (const n of items) {
              if (!ids.has(n.id)) {
                merged.push(n);
                newCount++;
                console.log('🆕 Added new polled notification:', n.id || 'Unknown ID', n.title || 'No title');
              }
            }
            console.log('🔄 Added', newCount, 'new notifications from polling');
            return merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          });
        } else {
          console.log('🔄 No new notifications from polling');
        }
      }
    } catch (error) {
      console.error('💥 Error polling new notifications:', error);
    }
  }, [isLoggedIn]);

  // Handle app state changes + intervals. Run once.
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && isLoggedIn) {
        fetchNotifications();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Initial fetch once if logged in
    if (isLoggedIn) {
      fetchNotifications();
    }

    // Periodic background fetch (every 5 minutes when app is active and user is logged in)
    const recentInterval = setInterval(() => {
      if (AppState.currentState === 'active' && isLoggedIn) {
        fetchNotifications();
      }
    }, 5 * 60 * 1000);

    // Poll new notifications every 60 seconds when app is active and user is logged in
    const newInterval = setInterval(() => {
      if (AppState.currentState === 'active' && isLoggedIn) {
        pollNewNotifications();
      }
    }, 60 * 1000);

    return () => {
      subscription?.remove();
      clearInterval(recentInterval);
      clearInterval(newInterval);
    };
  }, [isLoggedIn, fetchNotifications, pollNewNotifications]);

  // Clear notifications when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      console.log('User logged out, clearing notifications');
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      // Reset fetch timing
      lastFetchTimeRef.current = 0;
      isFetchingRef.current = false;
    }
  }, [isLoggedIn]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;