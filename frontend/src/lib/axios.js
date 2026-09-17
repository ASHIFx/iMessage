import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((request) => {
  const token = localStorage.getItem("accessToken");
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});
