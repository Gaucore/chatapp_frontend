import { defineStore } from "pinia";
import api from "../api/axios";

export const useGroupStore = defineStore("group", {
  state: () => ({
    groups: [],
    selectedUsers: [],
    activeGroup: null,
    loading: false,
  }),

  actions: {

    async fetchGroups() {
      this.loading = true;
      try {
        const res = await api.get("/groups");
        this.groups = res.data.groups || [];
      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
    },

    toggleUser(user) {
      const exists = this.selectedUsers.find(u => u._id === user._id);

      if (exists) {
        this.selectedUsers = this.selectedUsers.filter(u => u._id !== user._id);
      } else {
        this.selectedUsers.push(user);
      }
    },

    clearSelection() {
      this.selectedUsers = [];
    },

    async createGroup(name, description) {
      const members = this.selectedUsers.map(u => u._id);

      const res = await api.post("/groups", {
        name,
        description,
        members,
      });

      this.groups.unshift(res.data.group);
      this.clearSelection();

      return res.data.group;
    },

    setActiveGroup(group) {
      this.activeGroup = group;
    },
  },
});