import { defineStore } from "pinia";
import api from "../api/axios";

export const useUserStore = defineStore(
  "user",
  {
    state: () => ({
      users: [],
    }),

    actions: {
      async getUsers() {
        try {

          const res =
            await api.get("/users");

          this.users = res.data.users;

          console.log('all users',this.users);
            

        } catch (err) {

          console.log(
            err.response?.data
          );

        }
      },
    },
  }
);