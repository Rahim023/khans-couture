
import axios from "axios";

const envUrl = import.meta.env.VITE_API_URL;
const configuredUrl = envUrl?.trim();

const getBaseUrl = () => {
  if (!configuredUrl) return "https://khans-couture.onrender.com/api";

  const normalizedUrl = configuredUrl.replace(/\/+$/, "");
  return /\/api$/i.test(normalizedUrl) ? normalizedUrl : `${normalizedUrl}/api`;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
});
export default api;