import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api"),
  timeout: 8000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((request) => {
  const token = localStorage.getItem("accessToken");
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});
