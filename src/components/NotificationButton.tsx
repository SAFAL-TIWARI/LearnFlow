import React, { useState, useEffect } from 'react';
import { 
  areNotificationsEnabled, 
  requestNotificationPermission, 
  sendEducationalNotification 
} from '../utils/notificationUtils';

const NotificationButton: React.FC = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Set up event listener to update permission state if it changes
      const checkPermissionChange = () => {
        setNotificationPermission(Notification.permission);
      };
      
      document.addEventListener('visibilitychange', checkPermissionChange);
      return () => {
        document.removeEventListener('visibilitychange', checkPermissionChange);
      };
    }
  }, []);

  // Function to handle notification button click
  const handleNotificationClick = async () => {
    if (notificationPermission === 'default' || notificationPermission === 'denied') {
      const granted = await requestNotificationPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
      
      if (granted) {
        sendEducationalNotification(
          'Notifications Enabled',
          'You will now receive important educational updates and announcements.'
        );
      }
    } else if (notificationPermission === 'granted') {
      // If already granted, show a test notification
      sendEducationalNotification(
        'Notification Test',
        'Notification system is working! You will receive important educational updates.'
      );
    }
  };

  // If browser doesn't support notifications, don't render the button
  if (!('Notification' in window)) {
    return null;
  }

  return (
    <button
      onClick={handleNotificationClick}
      className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors flex items-center"
      aria-label="Notifications"
    >
      {notificationPermission === 'granted' ? (
        // Bell icon with notification enabled
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ) : (
        // Bell icon with notification disabled
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )}
      Notifications
    </button>
  );
};

export default NotificationButton;