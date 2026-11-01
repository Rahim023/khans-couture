import axios from "axios";

const API_BASE = import.meta.env?.VITE_API_BASE || "https://khans-couture.onrender.com";

export const fetchAssets = async () => {
  const response = await axios.get(`${API_BASE}/api/assets`);
  return response.data;
};
