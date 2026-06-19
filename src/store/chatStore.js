import { defineStore } from "pinia";
import api from "../api/axios";
import socket from "../socket/socket";

export const useChatStore = defineStore("chat", {
  state: () => ({
    chats: [],
    activeChat: null,
    onlineUsers: [],
    typingUser: false,
  }),

  actions: {
    // ======================
    // GET CHATS
    // ======================
    async getChats() {
      try {
        const res = await api.get("/chats");

        console.log(
          "CHATS RESPONSE:",
          res.data
        );

        this.chats =
          res.data.chats || [];

      } catch (err) {
        console.log(
          "GET CHATS ERROR:",
          err.response?.data
        );

        this.chats = [];
      }
    },

    // ======================
    // CREATE / OPEN CHAT
    // ======================
    async createOrOpenChat(userId) {
      try {
        const res =
          await api.post(
            "/chats",
            { userId }
          );

        this.activeChat =
          res.data.chat;

        socket.emit(
          "join-chat",
          res.data.chat._id
        );

        return res.data.chat;

      } catch (err) {
        console.log(
          "CREATE CHAT ERROR:",
          err.response?.data
        );
      }
    },

    // ======================
    // SOCKET
    // ======================
    initSocketListeners() {
      socket.off(
        "online-users"
      );

      socket.on(
        "online-users",
        (users) => {
          this.onlineUsers =
            users;
        }
      );
    },
  },
});