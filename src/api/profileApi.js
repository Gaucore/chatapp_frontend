import api from "./axios";

export const getProfile = () => api.get("/users/profile");

export const updateProfile = (data) =>
  api.put("/users/profile", data);

export const changePassword = (data) =>
  api.put("/users/change-password", data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.put("/users/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};