const API_BASE = import.meta.env.VITE_API_BASE || "https://khans-couture.onrender.com";

export const postCustomOrder = async (formData) => {
  try {
    const res = await fetch(`${API_BASE}/api/custom-orders`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Server error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Connection refused: Unable to reach the backend at https://khans-couture.onrender.com");
    }
    throw error;
  }
};

export const fetchCustomOrders = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/custom-orders`);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Connection refused: Unable to reach the server");
    }
    throw error;
  }
};

export const updateCustomOrder = async (id, updates) => {
  try {
    const res = await fetch(`${API_BASE}/api/custom-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update");
    return res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Connection refused: Unable to reach the server");
    }
    throw error;
  }
};

export const deleteCustomOrder = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/api/custom-orders/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    return res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Connection refused: Unable to reach the server");
    }
    throw error;
  }
};
