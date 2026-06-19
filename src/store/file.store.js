import { defineStore } from "pinia";
import api from "../api/axios";

export const useFileStore = defineStore("file", {
  state: () => ({
    uploading: false,
    uploadedFile: null,
  }),

  actions: {
    async uploadFile(file, type = "file") {
            try {
              this.uploading = true;

              const formData = new FormData();
              formData.append("file", file); // ✅ FIXED

              const token = localStorage.getItem("token");

              const res = await api.post("/files/upload", formData, { // ✅ FIXED ROUTE
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${token}`,
                },
              });

              return {
                type,
                url: res.data.url,
                mime: file.type,
                name: file.name,
              };

            } finally {
              this.uploading = false;
            }
          }
  },
});