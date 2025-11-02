// Unified notification content builder for consistent, polished style
// Inspired by Facebook-style notification presentation

export function buildNotificationContent(n) {
  const safeTitle = n?.title?.trim();
  const safeBody = n?.body?.trim();

  const title = `UCCP · ${safeTitle || 'Update'}`;
  const bodyRaw = safeBody || 'You have a new notification.';
  const body = bodyRaw.length > 140 ? bodyRaw.slice(0, 137) + '…' : bodyRaw;

  const content = {
    title,
    body,
    sound: 'default',
    badge: 1,
    data: {
      eventId: n?.event_id,
      notificationId: n?.id,
      type: n?.type || 'event_notification',
    },
    // iOS enhancements
    subtitle: 'Activity',
    launchImageName: 'SplashScreen',
    categoryIdentifier: 'EVENT_NOTIFICATION',
  };

  // iOS-only image attachment support
  if (n?.image_url) {
    content.attachments = [
      {
        url: n.image_url,
        type: 'image',
      },
    ];
  }

  return content;
}