"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DealersPage() {
  const [dealers, setDealers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [editingDealer, setEditingDealer] = useState(null); // ✅ for edit

  useEffect(() => {
    async function fetchData() {
      try {
        const [dealerRes, tripRes] = await Promise.all([
          axios.get("/api/dealers"),
          axios.get("/api/trips"),
        ]);
        setDealers(dealerRes.data);
        setTrips(tripRes.data);
      } catch (err) {
        console.error("Error fetching dealers or trips:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function calculateDealerData(dealerId) {
    const dealerTrips = trips.filter((t) => t.dealer?._id === dealerId);

    const totalSale = dealerTrips.reduce((sum, t) => sum + (t.total_sale || 0), 0);
    const amountPaid = dealerTrips.reduce((sum, t) => sum + (t.amount_received || 0), 0);
    const amountLeft = totalSale - amountPaid;

    return { totalSale, amountPaid, amountLeft };
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editingDealer) {
        // ✅ Edit existing dealer
        const res = await axios.put(`/api/dealers/${editingDealer._id}`, form);
        setDealers((prev) =>
          prev.map((d) => (d._id === editingDealer._id ? res.data : d))
        );
      } else {
        // ✅ Add new dealer
        const res = await axios.post("/api/dealers", form);
        setDealers([...dealers, res.data]);
      }
      setShowPrompt(false);
      setEditingDealer(null);
      setForm({ name: "" });
    } catch (err) {
      console.error("Error saving dealer:", err);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this dealer?")) return;

    try {
      await axios.delete(`/api/dealers/${id}`);
      setDealers((prev) => prev.filter((d) => d._id !== id));

    } catch (err) {
      console.error("Error deleting dealer:", err);
    }
  }


  function handleEdit(dealer) {
    setEditingDealer(dealer);
    setForm({ name: dealer.name });
    setShowPrompt(true);
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">Dealers</h1>

      <button
        onClick={() => setShowPrompt(true)}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
      >
        + Add Dealer
      </button>

      {showPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 text-orange-600">
              {editingDealer ? "Edit Dealer" : "Add New Dealer"}
            </h2>
            <form onSubmit={handleSave}>
              <input
                type="text"
                placeholder="Dealer Name"
                className="border p-2 w-full mb-4 rounded-lg focus:ring-2 focus:ring-orange-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  onClick={() => {
                    setShowPrompt(false);
                    setEditingDealer(null);
                    setForm({ name: "" });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {editingDealer ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-4 py-2 border">Dealer Name</th>
              <th className="px-4 py-2 border">Total Sale</th>
              <th className="px-4 py-2 border">Paid</th>
              <th className="px-4 py-2 border">Amount Left</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((dealer) => {
              const { totalSale, amountPaid, amountLeft } = calculateDealerData(dealer._id);
              return (
                <tr key={dealer._id} className="text-center">
                  <td className="border px-4 py-2">{dealer.name}</td>
                  <td className="border px-4 py-2">{totalSale}</td>
                  <td className="border px-4 py-2">{amountPaid}</td>
                  <td className="border px-4 py-2">{amountLeft}</td>
                  <td className="border px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(dealer)}
                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dealer._id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
