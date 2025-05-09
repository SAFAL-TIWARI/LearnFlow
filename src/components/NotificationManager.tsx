import React, { useEffect } from 'react';
import { 
  requestNotificationPermission, 
  sendEducationalNotification 
} from '../utils/notificationUtils';

const NotificationManager: React.FC = () => {
  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      // If permission is not determined yet, we'll show the browser's native permission request
      if (Notification.permission === 'default') {
        // We'll wait a few seconds before asking for permission to not overwhelm the user
        const timer = setTimeout(async () => {
          const granted = await requestNotificationPermission();
          
          if (granted) {
            sendEducationalNotification(
              'Welcome to LearnFlow!',
              'You will now receive important educational updates and announcements.'
            );
          }
        }, 3000); // Wait 3 seconds before prompting

        return () => clearTimeout(timer);
      }
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default NotificationManager;