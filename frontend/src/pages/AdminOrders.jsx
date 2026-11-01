import React, { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://khans-couture.onrender.com/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch admin orders");
        }

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Admin orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-brand-mist p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serifFancy font-bold text-brand-navy mb-6">All Orders</h1>

        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-brand-charcoal">No orders found.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-brand-gold/20">
            <table className="min-w-full text-left">
              <thead className="bg-brand-navy text-brand-ivory">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-brand-gold/10">
                    <td className="px-4 py-3 text-brand-navy font-medium">{order.customer?.name || order.user?.username || "Customer"}</td>
                    <td className="px-4 py-3">{order.customer?.email || order.user?.email || "-"}</td>
                    <td className="px-4 py-3">{order.customer?.phone || order.user?.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹{Number(order.totalINR || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(order)} className="bg-brand-gold text-brand-navy font-bold px-3 py-2 rounded-lg">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-brand-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-brand-navy">Order Details</h2>
              <button onClick={() => setSelected(null)} className="px-3 py-2 border border-brand-gold rounded-lg">Close</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-brand-navy mb-2">Customer</h3>
                <p>{selected.customer?.name}</p>
                <p>{selected.customer?.email}</p>
                <p>{selected.customer?.phone}</p>
              </div>
              <div>
                <h3 className="font-bold text-brand-navy mb-2">Shipping</h3>
                <p>{selected.shippingAddress?.firstName} {selected.shippingAddress?.lastName}</p>
                <p>{selected.shippingAddress?.addressLine1}</p>
                <p>{selected.shippingAddress?.addressLine2}</p>
                <p>{selected.shippingAddress?.city}, {selected.shippingAddress?.state} {selected.shippingAddress?.postalCode}</p>
                <p>{selected.shippingAddress?.country}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-brand-navy mb-2">Items</h3>
              <ul className="space-y-2">
                {selected.items?.map((item, index) => (
                  <li key={`${item.productId}-${index}`} className="border-b border-brand-gold/10 pb-2">
                    {item.title} × {item.quantity} — ₹{Number(item.price * item.quantity).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
