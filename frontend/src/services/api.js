
import axios from "axios";

const envUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: envUrl ? envUrl.trim() : "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});
export default api;