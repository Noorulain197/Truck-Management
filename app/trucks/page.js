"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function TrucksPage() {
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null); // 🚀 null = add mode
  const [form, setForm] = useState({
    number: "",
    model: "",
    capacity: "",
    currentMileage: "",
  });

  // fetch trucks + trips
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [truckRes, tripRes] = await Promise.all([
        axios.get("/api/trucks"),
        axios.get("/api/trips"),
      ]);
      // ✅ Safe array setting
      setTrucks(Array.isArray(truckRes.data) ? truckRes.data : []);
      setTrips(Array.isArray(tripRes.data) ? tripRes.data : []);
    } catch (err) {
      console.error("Error fetching trucks or trips:", err);
      // ✅ Set empty arrays on error
      setTrucks([]);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  // truckwise income calc
  function calculateIncome(truckId) {
    const truckTrips = trips.filter((t) => t.truck?._id === truckId);
    return truckTrips.reduce((sum, t) => sum + (t.total_sale || 0), 0);
  }

  // add / update truck
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingTruck) {
        // ✏️ Update
        const res = await axios.put(`/api/trucks/${editingTruck._id}`, form);
        setTrucks((prev) =>
          Array.isArray(prev) ? prev.map((t) => (t._id === editingTruck._id ? res.data : t)) : []
        );
      } else {
        // ➕ Add new
        const res = await axios.post("/api/trucks", form);
        setTrucks((prev) => [...(Array.isArray(prev) ? prev : []), res.data]);
      }

      setForm({ number: "", model: "", capacity: "", currentMileage: "" });
      setEditingTruck(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving truck:", err);
    }
  }

  // delete truck
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this truck?")) return;
    try {
      await axios.delete(`/api/trucks/${id}`);
      setTrucks((prev) => Array.isArray(prev) ? prev.filter((t) => t._id !== id) : []);
    } catch (err) {
      console.error("Error deleting truck:", err);
    }
  }

  // open edit modal
  function handleEdit(truck) {
    setEditingTruck(truck);
    setForm({
      number: truck.number || "",
      model: truck.model || "",
      capacity: truck.capacity ?? "",
      currentMileage: truck.currentMileage ?? "",
    });
    setShowForm(true);
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Trucks</h1>
          <p className="text-sm text-gray-500">
            Manage trucks, their capacities, mileage, and income records.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTruck(null);
            setForm({ number: "", model: "", capacity: "", currentMileage: "" });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all"
        >
          + Add Truck
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border p-2 text-left">Truck Number</th>
              <th className="border p-2 text-left">Truck Model</th>
              <th className="border p-2 text-center">Capacity</th>
              <th className="border p-2 text-center">Truckwise Income</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(trucks) && trucks.map((truck) => (
              <tr key={truck._id} className="text-center hover:bg-gray-50 transition-all">
                <td className="border p-2 text-left font-medium text-gray-800">{truck.number || "N/A"}</td>
                <td className="border p-2 text-left text-gray-700">{truck.model || "N/A"}</td>
                <td className="border p-2 text-gray-700">{truck.capacity || 0}</td>
                <td className="border p-2 text-gray-700">{calculateIncome(truck._id)}</td>
                <td className="border p-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(truck)}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs sm:text-sm transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(truck._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Data */}
      {trucks.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No truck records found
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTruck ? "Edit Truck" : "Add New Truck"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Truck Number</label>
                <input
                  type="text"
                  required
                  value={form.number || ""}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., LHR-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={form.model || ""}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., Volvo FH16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (tons)</label>
                <input
                  type="number"
                  value={form.capacity || ""}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage (km)</label>
                <input
                  type="number"
                  value={form.currentMileage || ""}
                  onChange={(e) => setForm({ ...form, currentMileage: e.target.value })}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., 40000"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-all"
                >
                  {editingTruck ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}