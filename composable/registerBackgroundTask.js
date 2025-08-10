// src/backgroundTasks/registerBackgroundTask.js
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UseMethod } from './useMethod';

const TASK_NAME = 'TEST_NOTIFICATION_TASK';

// Define the background task
TaskManager.defineTask(TASK_NAME, async () => {
  console.log("⏰ Background task running...");

  try {
    // Check if api_token exists
    const apiToken = await AsyncStorage.getItem('api_token');
    if (!apiToken) {
      console.log("🔒 No API token, skipping notification fetch");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Fetch new notifications from your API
    const response = await UseMethod('get', 'notifications/new');

    if (response?.data?.data?.length > 0) {
      const notifications = response.data.data;
      console.log(`📢 Found ${notifications.length} new notifications`);

      // Send notifications one by one
      for (const notif of notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notif.title || 'New Notification',
            body: notif.body || 'You have a new update!',
            sound: 'default',
            data: { eventId: notif.event_id }, // Pass event ID
          },
          trigger: null, // show immediately
        });

        console.log(`📨 Notification sent: ${notif.title || notif.body}`);
        await new Promise((res) => setTimeout(res, 5000)); // Wait 5 sec between
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log("ℹ️ No new notifications");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (err) {
    console.error("🚨 Error in background task:", err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task
export async function registerBackgroundTask() {
  try {
    const tasks = await TaskManager.getRegisteredTasksAsync();
    const isRegistered = tasks.some(task => task.taskName === TASK_NAME);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 30, // ⏱ try every 30s (only works reliably on Android in foreground)
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("✅ Background task registered");
    } else {
      console.log("ℹ️ Background task already registered");
    }
  } catch (err) {
    console.log("🚨 Error registering background task", err);
  }
}
