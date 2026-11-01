
import axios from "axios";

const envUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: envUrl ? envUrl.trim() : "https://khans-couture.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});
export default api;