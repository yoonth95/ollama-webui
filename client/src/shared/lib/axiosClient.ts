import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});
