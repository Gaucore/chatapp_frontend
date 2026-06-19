import { defineStore } from "pinia";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../api/profileApi";

export const useProfileStore = defineStore("profile", {
  state: () => ({
    user: null,
  }),

  actions: {
    async fetchProfile() {
      const res = await getProfile();
      this.user = res.data.user;
    },

    async updateProfile(data) {
      const res = await updateProfile(data);
      this.user = res.data.user;
    },

    async changePassword(data) {
      await changePassword(data);
    },

    async uploadAvatar(file) {
      const res = await uploadAvatar(file);
      this.user.avatar = res.data.avatar;
       return res.data.avatar;
    },
  },
});