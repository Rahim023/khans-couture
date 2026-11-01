import axios from "axios";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

export const fetchAssets = async () => {
  const response = await axios.get(`${API_BASE}/api/assets`);
  return response.data;
};
