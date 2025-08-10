// src/composable/useNotificationPolling.js
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

export default function useNotificationPolling() {
  useEffect(() => {
    const sendTestNotification = async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: `Random number: ${Math.floor(Math.random() * 100)}`,
          sound: "default",
        },
        trigger: null,
      });
    };

    sendTestNotification();
    const interval = setInterval(sendTestNotification, 5000);

    return () => clearInterval(interval);
  }, []);
}
