import axios from "axios";
import { getToken } from "../context/AuthContext";

const instance = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:5000",
});

instance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
