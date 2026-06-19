import { defineStore } from "pinia";
import api from "../api/axios";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
    unreadCount: 0,
  }),

  actions: {

    setNotifications(data) {
      this.notifications = data;
      this.unreadCount = data.filter(n => !n.isRead).length;
    },

    addNotification(notification) {
      this.notifications.unshift(notification);
      if (!notification.isRead) this.unreadCount++;
    },

    markAsRead(id) {
      const n = this.notifications.find(x => x._id === id);
      if (n) n.isRead = true;

      this.unreadCount = this.notifications.filter(n => !n.isRead).length;
    },

    // GET NOTIFICATIONS
    async fetchNotifications() {
      const res = await api.get("/notifications");
      this.notifications = res.data.notifications;
      this.unreadCount = res.data.unreadCount;
    },

    // SINGLE READ API
    async markOneAsRead(id) {
      const res = await api.put(`/notifications/${id}`);
      this.markAsRead(id);
      this.unreadCount = res.data.unreadCount;
    },

    // READ ALL API
    async markAllAsRead() {
      await api.put("/notifications/read-all");

      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    },

    // ⭐ CLEAR ALL (FIXED)
    async clearAll() {
      await api.delete("/notifications/clear");

      this.notifications = [];
      this.unreadCount = 0;
    },

  },
});