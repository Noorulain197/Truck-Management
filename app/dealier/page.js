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
        // ✅ Safe array setting
        setDealers(Array.isArray(dealerRes.data) ? dealerRes.data : []);
        setTrips(Array.isArray(tripRes.data) ? tripRes.data : []);
      } catch (err) {
        console.error("Error fetching dealers or trips:", err);
        // ✅ Set empty arrays on error
        setDealers([]);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function calculateDealerData(dealerId) {
    // ✅ Safe check for trips array
    if (!Array.isArray(trips)) {
      return { totalSale: 0, amountPaid: 0, amountLeft: 0 };
    }
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
          Array.isArray(prev) ? prev.map((d) => (d._id === editingDealer._id ? res.data : d)) : []
        );
      } else {
        // ✅ Add new dealer
        const res = await axios.post("/api/dealers", form);
        setDealers((prev) => [...(Array.isArray(prev) ? prev : []), res.data]);
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
      setDealers((prev) => Array.isArray(prev) ? prev.filter((d) => d._id !== id) : []);
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
    <div className="p-4 sm:p-6 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dealers</h1>
          <p className="text-sm text-gray-500">
            Manage your dealers, track payments, and view outstanding balances.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowPrompt(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all"
          >
            + Add Dealer
          </button>
        </div>
      </div>

      {/* Add/Edit Dealer Modal */}
      {showPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80 sm:w-96 border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {editingDealer ? "Edit Dealer" : "Add New Dealer"}
            </h2>
            <form onSubmit={handleSave}>
              <input
                type="text"
                placeholder="Dealer Name"
                className="border p-2 w-full mb-4 rounded-md focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded-md hover:bg-gray-400 transition-all"
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
                  className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-all"
                >
                  {editingDealer ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dealers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Dealer Name</th>
              <th className="p-2 border">Total Sale</th>
              <th className="p-2 border">Paid</th>
              <th className="p-2 border">Amount Left</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(dealers) && dealers.map((dealer) => {
              const { totalSale, amountPaid, amountLeft } = calculateDealerData(dealer._id);
              return (
                <tr key={dealer._id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{dealer.name}</td>
                  <td className="p-2 border">{totalSale}</td>
                  <td className="p-2 border">{amountPaid}</td>
                  <td className="p-2 border">{amountLeft}</td>
                  <td className="p-2 border">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(dealer)}
                        className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dealer._id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {dealers.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No dealers found — add your first one above.
        </div>
      )}
    </div>
  );
}