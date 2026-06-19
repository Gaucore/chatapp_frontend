import { defineStore } from "pinia";
import api from "../api/axios";
import socket from "../socket/socket";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || "",
    loading: false,
  }),

  actions: {

    // =====================
    // SOCKET INIT (FIXED + SAFE)
    // =====================
    initSocket(userId) {
      if (!socket.connected) {
        socket.connect();
      }

      socket.off("connect");

      socket.on("connect", () => {
        socket.emit("user-online", userId);
      });
    },

    // =====================
    // LOGIN
    // =====================
    async login(email, password) {
      try {
        this.loading = true;

        const res = await api.post("/auth/login", {
          email,
          password,
        });

        this.user = res.data.user || null;
        this.token = res.data.token || "";

        if (this.token) {
          localStorage.setItem("token", this.token);
        }

        // 🔥 SOCKET CONNECT
          if (this.user?._id) {
              setTimeout(() => {
                this.initSocket(this.user._id);
              }, 300);
            }

        return res.data;

      } catch (err) {
        console.error("Login error:", err.response?.data || err.message);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // =====================
    // REGISTER
    // =====================
    async register(userData) {
      try {
        this.loading = true;

        const res = await api.post("/auth/register", userData);

        this.user = res.data.user || null;
        this.token = res.data.token || "";

        if (this.token) {
          localStorage.setItem("token", this.token);
        }

        // 🔥 SOCKET CONNECT
        if (this.user?._id) {
          this.initSocket(this.user._id);
        }

        return res.data;

      } catch (err) {
        console.error("Register error:", err.response?.data || err.message);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // =====================
    // GET CURRENT USER (REFRESH FIX)
    // =====================
    async getCurrentUser() {
      try {
        const res = await api.get("/auth/me");

        this.user = res.data.user;

        // 🔥 SOCKET RECONNECT AFTER REFRESH
        if (this.user?._id) {
          this.initSocket(this.user._id);
        }

      } catch (err) {
        console.log("AUTH ERROR:", err.response?.data);
      }
    },

    // =====================
    // LOGOUT
    // =====================
    logout() {
      this.user = null;
      this.token = "";

      localStorage.removeItem("token");

      if (socket.connected) {
        socket.disconnect();
      }
    },

    // =====================
    // SET USER
    // =====================
    setUser(user) {
      this.user = user;
    },
  },
});