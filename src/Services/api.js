import axios from "axios";

const api = axios.create({
  baseURL: "https://api.lokchat.techiolazainnovations.in/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Signup
export const signupUser = async (userData) => {
  try {
    const res = await api.post("/register", userData);
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        status: "failed",
        message: "Network Error",
      }
    );
  }
};
// Login
export const loginUser = async (loginData) => {
  try {
    const res = await api.post("/login", loginData);
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        status: "failed",
        message: "Network Error",
      }
    );
  }
};
// Logout
export const logoutUser = async (email) => {
  try {
    const res = await api.post("/logout", {
      email,
    });

    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        status: "failed",
        message: "Network Error",
      }
    );
  }
};

// ✅ Fetch all registered users (used as contacts list for now)
export const getContacts = () => api.get(`/users`);

export const getConversation = (senderId, receiverId) =>
  api.get(`/messages/${senderId}/${receiverId}`);

export default api;
