// lib/axios.js
import Axios from "axios";

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    // console.log("Token:", token);
    // console.log(
    //   "Authorization Header:",
    //   token ? `Bearer ${token}` : "No token"
    // );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // console.log("Unauthorized, redirecting to login...");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;
