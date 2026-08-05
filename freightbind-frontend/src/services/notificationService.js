import axiosInstance from '../api/axiosInstance'; // Adjust import path if needed

const notificationService = {
  getNotifications: async (params = {}) => {
    // FIXED: Removed /api/ prefix - axiosInstance baseURL handles it
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  getNotificationById: async (id) => {
    const response = await axiosInstance.get(`/notifications/${id}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteReadNotifications: async () => {
    const response = await axiosInstance.delete('/notifications/read');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },
};

export default notificationService;