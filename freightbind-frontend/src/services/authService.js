import axiosInstance from "../api/axiosInstance";

// Reusable functions wrapping the existing backend auth endpoints.
// Never call axios directly from components — go through this service.

const login = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/auth/login", { email, password });
  return data.data; // { user, token }
};

const register = async ({ fullName, email, password, phone }) => {
  const { data } = await axiosInstance.post("/auth/register", { fullName, email, password, phone });
  return data.data; // { user, token }
};

const logout = async () => {
  const { data } = await axiosInstance.post("/auth/logout");
  return data.data;
};

const getCurrentUser = async () => {
  const { data } = await axiosInstance.get("/auth/me");
  return data.data.user;
};

const updateProfile = async (payload) => {
  const { data } = await axiosInstance.put("/auth/update-profile", payload);
  return data.data.user;
};

const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await axiosInstance.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data.data;
};

const authService = { login, register, logout, getCurrentUser, updateProfile, changePassword };

export default authService;
