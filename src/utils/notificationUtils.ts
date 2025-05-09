/**
 * Utility functions for handling browser notifications
 */

/**
 * Check if browser notifications are supported and enabled
 * @returns {boolean} True if notifications are supported and permission is granted
 */
export const areNotificationsEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Request permission to show notifications
 * @returns {Promise<boolean>} Promise resolving to true if permission was granted
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Send a notification to the user
 * @param {string} title - The notification title
 * @param {object} options - Notification options (body, icon, etc.)
 * @returns {Notification|null} The notification object or null if not supported/permitted
 */
export const sendNotification = (
  title: string, 
  options: NotificationOptions = {}
): Notification | null => {
  if (!areNotificationsEnabled()) {
    return null;
  }
  
  try {
    // Set default icon if not provided
    if (!options.icon) {
      options.icon = '/favicon.ico';
    }
    
    return new Notification(title, options);
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

/**
 * Send an educational notification to students
 * @param {string} subject - The subject of the notification
 * @param {string} message - The notification message
 * @returns {Notification|null} The notification object or null if not supported/permitted
 */
export const sendEducationalNotification = (
  subject: string,
  message: string
): Notification | null => {
  return sendNotification(`LearnFlow: ${subject}`, {
    body: message,
    icon: '/favicon.ico',
    tag: 'educational-notification'
  });
};

export default {
  areNotificationsEnabled,
  requestNotificationPermission,
  sendNotification,
  sendEducationalNotification
};