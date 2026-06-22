
// import { defineStore } from "pinia";
// import api from "../api/axios";
// import socket from "../socket/socket";

// export const useMessageStore = defineStore("message", {
//   state: () => ({
//     messages: [],
//     loading: false,
//   }),

//   actions: {
//     async getMessages(chatId) {
//       const res = await api.get(`/messages/${chatId}`);
//       this.messages = res.data.messages || [];
//     },

//     async sendMessage(chatId, content, type = "text", url = null) {
//       try {
//         const res = await api.post("/messages", {
//           chatId,
//           content,
//           type,
//           url,
//         });

//         socket.emit("send-message", res.data.message);
//       } catch (err) {
//         console.log(err);
//       }
//     },

//     initSocketListeners() {
//       socket.off("receive-message");

//       socket.on("receive-message", (message) => {
//         this.messages.push(message);
//       });
//     },
//   },
// });


import { defineStore } from "pinia";
import api from "../api/axios";
import socket from "../socket/socket";

export const useMessageStore = defineStore("message", {
  state: () => ({
    messages: [],
    loading: false,
  }),

  actions: {
    async getMessages(chatId) {
      const res = await api.get(`/messages/${chatId}`);
      this.messages = res.data.messages || [];
    },

    async sendMessage(chatId, content, type = "text", url = null) {
      const res = await api.post("/messages", {
        chatId,
        content,
        type,
        url,
      });

      // socket.emit("send-message", res.data.message);
    },

    async deleteMessage(messageId) {
      try {
        await api.delete(`/messages/${messageId}`);

        // Remove only from current user's UI
        this.messages = this.messages.filter(
          (m) => m._id !== messageId
        );
      } catch (err) {
        console.log(err);
      }
    },
    
    initSocketListeners() {
      socket.off("receive-message");
      socket.off("message-deleted");

      socket.on("receive-message", (message) => {
        this.messages.push(message);
      });

      socket.on("message-deleted", ({ messageId }) => {
        this.messages = this.messages.filter(
          (m) => m._id !== messageId
        );
      });
    },
  },
});