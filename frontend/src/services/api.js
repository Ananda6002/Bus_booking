import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartbus_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalizes backend error messages so components can just read err.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || "Something went wrong. Please try again.";
    return Promise.reject({ ...err, message });
  }
);

export default api;
