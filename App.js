import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from "expo-notifications";
import { registerBackgroundTask } from './composable/registerBackgroundTask';
import { createNavigationContainerRef } from '@react-navigation/native';
import { UseMethod } from './composable/useMethod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const navigationRef = createNavigationContainerRef();
  useEffect(() => {
    let intervalId;

    (async () => {
      await Notifications.requestPermissionsAsync();
      await registerBackgroundTask();

      // 🔄 Foreground polling every 30 seconds
      intervalId = setInterval(async () => {
        try {
          const token = await AsyncStorage.getItem('api_token');
          if (!token) {
            // Not logged in; skip polling
            return;
          }
          const res = await UseMethod('get', 'notifications/new');
          if (res?.data?.data?.length > 0) {
            for (const notif of res.data.data) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `UCCP EVENTS - ${notif.title || 'New Notification'}`,
                  body: notif.body || 'You have a new update!',
                  sound: 'default',
                  data: { eventId: notif.event_id },
                },
                trigger: null,
              });
              console.log(`📨 Foreground notification sent: ${notif.title || notif.body}`);
            }
          }
        } catch (err) {
          console.error("🚨 Error fetching foreground notifications:", err);
        }
      }, 30000); // 30 seconds
    })();

    // ✅ Listen for when a user taps the notification
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const notifData = response.notification.request.content.data;
      console.log("📬 Notification tapped:", notifData);

      if (notifData?.eventId) {
        try {
          const res = await UseMethod('get', `get-event/${notifData?.eventId}`);
          // Normalize event payload shape
          const event = res?.data?.event ?? res?.data?.data ?? res?.data;

          console.log("📦 Event data fetched:", event);

          if (event && event.id) {
            navigationRef.current?.navigate('EventDetails', { event, mode: 'register' });
          } else {
            // Fallback: navigate with eventId so EventDetails can fetch internally
            navigationRef.current?.navigate('EventDetails', { eventId: notifData?.eventId, mode: 'register' });
          }
        } catch (error) {
          console.error("🚨 Error fetching event data:", error);
          // On error, still navigate with eventId to let the screen handle fetching/retry
          navigationRef.current?.navigate('EventDetails', { eventId: notifData?.eventId, mode: 'register' });
        }
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId); // ⏹ stop polling when unmounts
      subscription.remove();
    };
  }, []);

  return (
    <PaperProvider>
      {/* Ensure system status bar icons are visible on light backgrounds */}
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <AuthProvider>
        <NotificationProvider>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
          </NavigationContainer>
        </NotificationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
