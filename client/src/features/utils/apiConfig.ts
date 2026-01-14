import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const PUBLIC_API = axios.create({
  baseURL: API_BASE_URL,
});

export const PRIVATE_API = axios.create({
  baseURL: API_BASE_URL,
});

PRIVATE_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

PRIVATE_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
