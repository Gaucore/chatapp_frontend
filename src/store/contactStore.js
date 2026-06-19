import { defineStore } from "pinia";
import api from "../api/axios";

export const useContactStore = defineStore("contact", {
  state: () => ({
    contacts: [],
    loading: false,
    searchResults: [],
  }),

  actions: {

    // ======================
    // GET CONTACTS
    // ======================
    async fetchContacts() {
      try {
        this.loading = true;

        const res = await api.get("/contacts");

        this.contacts = res.data.contacts || [];
      } catch (err) {
        console.error("Contact fetch error:", err);
      } finally {
        this.loading = false;
      }
    },

    // ======================
    // SEARCH USERS
    // ======================
    async searchUsers(keyword) {
      try {
        const res = await api.get(`/contacts/search?keyword=${keyword}`);

        this.searchResults = res.data.users || [];
      } catch (err) {
        console.error("Search error:", err);
      }
    },

    // ======================
    // ADD CONTACT
    // ======================
    async addContact(contactId) {
      try {
        await api.post("/contacts/add", { contactId });

        await this.fetchContacts();
      } catch (err) {
        console.error("Add contact error:", err);
      }
    },

    // ======================
    // REMOVE CONTACT
    // ======================
    async removeContact(contactId) {
      try {
        await api.delete("/contacts/remove", {
          data: { contactId },
        });

        await this.fetchContacts();
      } catch (err) {
        console.error("Remove contact error:", err);
      }
    },
  },
});