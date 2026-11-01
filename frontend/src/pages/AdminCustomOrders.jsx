import React, { useEffect, useState } from "react";
import { fetchCustomOrders, updateCustomOrder, deleteCustomOrder } from "../services/customOrderApi";

export default function AdminCustomOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateCustomOrder(id, { status });
      load();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    try {
      await deleteCustomOrder(id);
      load();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Custom Orders</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Order Type</th>
                <th className="px-4 py-2">Budget</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="px-4 py-2">{o.fullName}</td>
                  <td className="px-4 py-2">{o.email}</td>
                  <td className="px-4 py-2">{o.orderType}</td>
                  <td className="px-4 py-2">{o.budget}</td>
                  <td className="px-4 py-2">{o.status}</td>
                  <td className="px-4 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => setSelected(o)} className="mr-2 px-2 py-1 border rounded">View</button>
                    <button onClick={() => handleStatus(o._id, o.status === 'Pending' ? 'In Progress' : 'Completed')} className="mr-2 px-2 py-1 bg-[#23110b] text-efe6d0 rounded">Toggle Status</button>
                    <button onClick={() => handleDelete(o._id)} className="px-2 py-1 text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(selected, null, 2)}</pre>
          <button onClick={() => setSelected(null)} className="mt-2 px-3 py-1 border rounded">Close</button>
        </div>
      )}
    </div>
  );
}
