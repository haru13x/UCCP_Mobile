// src/backgroundTasks/registerBackgroundTask.js
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UseMethod } from './useMethod';

const TASK_NAME = 'TEST_NOTIFICATION_TASK';

// Define the background task
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log('🔄 Background task executing...');
    
    // Get the API token
    const api_token = await AsyncStorage.getItem('api_token');
    if (!api_token) {
      console.log('❌ No API token found in background task');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    console.log('✅ API token found, fetching notifications...');
    
    // Fetch new notifications
    const response = await UseMethod('get', 'notifications/new');

    const items = Array.isArray(response?.data?.data) ? response.data.data : [];
    if (items.length === 0) {
      console.log('ℹ️ No new notifications from API');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log('📬 New notifications received:', items.length);

    // Schedule notifications for each item
    for (const n of items) {
      const title = ` ${n.title || 'UCCP Event Update'}`;
      const body = n.body || 'You have a new event notification!';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          badge: 1,
          data: {
            eventId: n.event_id,
            notificationId: n.id,
            type: 'event_notification'
          },
          ...(n.image_url && {
            attachments: [{
              url: n.image_url,
              type: 'image'
            }]
          }),
          categoryIdentifier: 'EVENT_NOTIFICATION'
        },
        trigger: null // Show immediately
      });

      console.log('✅ Background notification sent:', n.id || 'Unknown ID', n.title || 'No title');
      // Add a small delay between notifications if there are multiple
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('🚨 Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task
export async function registerBackgroundTask() {
  try {
    // First, check if background fetch is available
    const status = await BackgroundFetch.getStatusAsync();
    console.log('📱 Background fetch status:', status);
    
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || 
        status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.warn('⚠️ Background fetch is restricted or denied');
      return;
    }

    const tasks = await TaskManager.getRegisteredTasksAsync();
    const isRegistered = tasks.some(task => task.taskName === TASK_NAME);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 15, // Reduced to 15 seconds for better responsiveness
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("✅ Background task registered successfully");
    } else {
      console.log("ℹ️ Background task already registered");
    }
    
    // Set up notification categories with action buttons
    await Notifications.setNotificationCategoryAsync('EVENT_NOTIFICATION', [
      {
        identifier: 'VIEW_EVENT',
        buttonTitle: 'View Event',
        options: {
          opensAppToForeground: true,
        },
      },
      // {
      //   identifier: 'MARK_READ',
      //   buttonTitle: '✅ Mark as Read',
      //   options: {
      //     opensAppToForeground: false,
      //   },
      // },
    ]);
    
    console.log("✅ Notification categories configured");
    
  } catch (err) {
    console.error("🚨 Error registering background task:", err);
  }
}
