import api from './api';

export const getMyNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data.data; // ✅ ONLY ARRAY
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getNotificationStats = async () => {
  try {
    const response = await api.get('/notifications/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

// Create notification (for testing/development)
export const createTestNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications/test', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating test notification:', error);
    throw error;
  }
};

// Real-time notification polling
export class NotificationPoller {
  constructor(onNewNotifications, interval = 30000) {
    this.onNewNotifications = onNewNotifications;
    this.interval = interval;
    this.pollingInterval = null;
    this.lastPollTime = null;
    this.isPolling = false;
  }

  start() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollingInterval = setInterval(() => this.poll(), this.interval);
    
    // Initial poll
    setTimeout(() => this.poll(), 1000);
    
    console.log('Notification polling started');
  }

  stop() {
    if (!this.isPolling) return;
    
    this.isPolling = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    console.log('Notification polling stopped');
  }

  async poll() {
    try {
      const stats = await getNotificationStats();
      if (stats.data?.unseenCount > 0) {
        const notifications = await getMyNotifications({
          limit: 5,
          unreadOnly: true,
          sort: 'createdAt:desc'
        });
        
        if (notifications.data?.length > 0) {
          this.onNewNotifications(notifications.data);
        }
      }
      
      this.lastPollTime = new Date();
    } catch (error) {
      console.error('Notification poll error:', error);
    }
  }

  // Manually trigger a poll
  triggerPoll() {
    this.poll();
  }
}

// Export a singleton instance
export const notificationPoller = new NotificationPoller((notifications) => {
  // Default handler - can be overridden
  console.log('New notifications:', notifications);
});